(function(){
"use strict";
const $=selector=>document.querySelector(selector);
const state={catalog:null,query:"",category:"",type:"",grade:"",subject:""};
const TYPE_LABELS={
 "performans-gorevi":"Performans görevi","rubrik":"Rubrik","gozlem-formu":"Gözlem formu","portfolyo":"Portfolyo / gelişim dosyası",
 "etkinlik":"Etkinlik","calisma-kagidi":"Çalışma kâğıdı","oz-akran-degerlendirme":"Öz / akran değerlendirme","kilavuz":"Kılavuz","diger":"Diğer"
};
const GRADE_LABELS={"okul-oncesi":"Okul öncesi","ilkokul":"İlkokul (1–4)","ortaokul":"Ortaokul (5–8)","lise":"Lise (9–12)","tum-duzeyler":"Tüm düzeyler"};
const FORMAT_SHORT={PDF:"PDF",DOCX:"DOC",XLSX:"XLS",PPTX:"PPT",LINK:"Web",HTML:"Web",OTHER:"Dosya"};
const SMOOTH=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";
function normalize(value){return String(value==null?"":value).toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").trim();}
function setText(node,value){node.textContent=value==null?"":String(value);}
function appendOptions(select,items,valueKey,labelKey){items.forEach(item=>{const option=document.createElement("option");option.value=item[valueKey];option.textContent=item[labelKey];select.appendChild(option);});}
function make(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function categories(){return state.catalog.categories||[];}
function visibleResources(){return (state.catalog.resources||[]).filter(item=>!item.status||item.status==="published");}
function clearElement(node){while(node.firstChild)node.removeChild(node.firstChild);}
function activeFilters(){return Boolean(state.query||state.category||state.type||state.grade||state.subject);}
function updateClearButton(){$("#clear-filters").hidden=!activeFilters();}
function renderCategories(){
 const list=$("#category-list");clearElement(list);
 const icons={
  "olcme-degerlendirme":"◫","etkinlikler":"✳","egilimler":"↗",
  "erdem-deger-eylem":"◇","sosyal-duygusal-beceriler":"◎",
  "farklilastirma":"◌","planlama-raporlama":"▤"
 };
 categories().forEach((category,index)=>{
  const button=make("button","category-option");button.type="button";
  button.setAttribute("aria-pressed",state.category===category.id?"true":"false");
  button.setAttribute("aria-label",category.title+" kategorisini filtrele");
  button.append(make("span","category-option-index",String(index+1).padStart(2,"0")));
  const title=make("span","category-option-title");
  title.append(make("span","category-option-icon",icons[category.id]||"○"));
  title.append(make("span","category-option-label",category.title));
  button.append(title);
  button.append(make("span","category-option-description",category.description));
  const matches=visibleResources().filter(item=>item.categoryId===category.id).length;
  button.append(make("span","category-option-count",matches?matches+" kaynak":"Yakında"));
  button.append(make("span","category-option-arrow","↗"));
  button.addEventListener("click",()=>{
   state.category=state.category===category.id?"":category.id;
   $("#filter-category").value=state.category;renderCategories();renderResources();
   $("#results").scrollIntoView({behavior:SMOOTH,block:"start"});
  });
  list.append(button);
 });
 $("#category-count").textContent=categories().length+" alan";
}
function filteredResources(){
 const categoryNames=new Map(categories().map(item=>[item.id,item.title]));const query=normalize(state.query);
 return visibleResources().filter(resource=>{
  if(state.category&&resource.categoryId!==state.category)return false;
  if(state.type&&resource.type!==state.type)return false;
  if(state.grade&&!(resource.grades||[]).includes(state.grade)&&!(resource.grades||[]).includes("tum-duzeyler"))return false;
  if(state.subject&&!(resource.subjects||[]).some(subject=>normalize(subject)===normalize(state.subject)||normalize(subject)==="tum dersler"))return false;
  const haystack=[resource.title,resource.summary,resource.type,resource.categoryId,categoryNames.get(resource.categoryId),(resource.tags||[]).join(" "),(resource.grades||[]).map(grade=>GRADE_LABELS[grade]||grade).join(" "),(resource.subjects||[]).join(" "),(resource.outcomes||[]).join(" ")].join(" ");
  return !query||normalize(haystack).includes(query);
 });
}
function safeResourceUrl(resource){
 const raw=resource.sourceType==="external"&&resource.sourceUrl?resource.sourceUrl:resource.file;
 if(!raw)return "";
 if(raw.startsWith("https://")||raw.startsWith("http://"))return raw;
 const validPath=raw.startsWith("content/")&&raw.split("/").every(part=>part&&part!=="."&&part!==".."&&/^[a-zA-Z0-9._-]+$/.test(part));
 return validPath?raw:"";
}
function levelLabel(resource){
 const levels=(resource.grades||[]).map(grade=>GRADE_LABELS[grade]||grade);
 return levels.length?levels.join(" · "):"Tüm düzeyler";
}
function renderResource(resource,index){
 const row=make("article","resource-row");
 const link=safeResourceUrl(resource);const external=link.startsWith("http://")||link.startsWith("https://");
 const anchor=make("a","resource-link");anchor.href=link||"#";if(external){anchor.target="_blank";anchor.rel="noopener noreferrer";}else if(link){anchor.setAttribute("download","");}
 const main=make("span","resource-main");
  main.append(make("span","resource-file-icon",FORMAT_SHORT[resource.format]||"Dosya"));
 const copy=make("span","resource-main-text");copy.append(make("strong","",resource.title||"Başlıksız kaynak"),make("small","",resource.summary||"Açıklama henüz eklenmedi."));main.append(copy);anchor.append(main);
 const kind=make("span","resource-kind");const category=categories().find(item=>item.id===resource.categoryId);if(category)kind.append(make("span","",category.title));kind.append(make("span","",TYPE_LABELS[resource.type]||resource.type||"Diğer"));anchor.append(kind);
 const level=make("span","resource-level",levelLabel(resource));if(resource.updatedAt){const d=new Date(resource.updatedAt);if(!isNaN(d))level.append(make("small","","Güncelleme: "+d.toLocaleDateString("tr-TR")));}anchor.append(level);anchor.append(make("span","resource-arrow","›"));
 if(!link){anchor.removeAttribute("href");anchor.setAttribute("aria-disabled","true");anchor.classList.add("resource-link-disabled");}
 row.append(anchor);return row;
}
function renderResources(){
 const list=$("#resource-list");clearElement(list);const all=visibleResources();const matches=filteredResources();updateClearButton();
 $("#result-summary").textContent=all.length?(matches.length+" / "+all.length+" kaynak gösteriliyor"):"Kaynaklar içerik eklendikçe burada görünecek";
 if(!all.length){
  const empty=make("div","empty-state");
  empty.append(make("span","empty-state-symbol","↗"));
  const copy=make("div","empty-state-copy");copy.append(make("h4","","Kaynaklar yakında burada."),make("p","","Kütüphane şu an hazırlanıyor. Öneri ve eksik kaynak bildirimi için bize yazabilirsin."));empty.append(copy);
  const guide=make("a","empty-state-code","Kaynak öner");guide.href="#katki";empty.append(guide);list.append(empty);return;
 }
 if(!matches.length){const empty=make("div","empty-state");empty.append(make("span","empty-state-symbol","⌕"));const copy=make("div","empty-state-copy");copy.append(make("h4","","Bu aramayla eşleşen kaynak bulunamadı."),make("p","","Arama sözcüğünü değiştir veya filtreleri temizleyip yeniden dene."));empty.append(copy);const clear=make("button","empty-state-code","Filtreleri temizle");clear.type="button";clear.addEventListener("click",clearFilters);empty.append(clear);list.append(empty);return;}
 matches.forEach((resource,index)=>list.append(renderResource(resource,index)));
}
function clearFilters(){
 state.query="";state.category="";state.type="";state.grade="";state.subject="";
 $("#resource-search").value="";$("#filter-category").value="";$("#filter-type").value="";$("#filter-grade").value="";$("#filter-subject").value="";
 renderCategories();renderResources();
}
function bindUI(){
 $("#resource-search").addEventListener("input",event=>{state.query=event.target.value;renderResources();});
 $("#filter-category").addEventListener("change",event=>{state.category=event.target.value;renderCategories();renderResources();});
 $("#filter-type").addEventListener("change",event=>{state.type=event.target.value;renderResources();});
 $("#filter-grade").addEventListener("change",event=>{state.grade=event.target.value;renderResources();});
 $("#filter-subject").addEventListener("change",event=>{state.subject=event.target.value;renderResources();});
 $("#clear-filters").addEventListener("click",clearFilters);
 document.querySelectorAll("[data-jump-category]").forEach(link=>link.addEventListener("click",event=>{event.preventDefault();const id=link.getAttribute("data-jump-category");state.category=state.category===id?"":id;$("#filter-category").value=state.category;renderCategories();renderResources();$("#kutuphane").scrollIntoView({behavior:SMOOTH,block:"start"});}));
 $("#hero-search-form").addEventListener("submit",event=>{event.preventDefault();const value=$("#hero-search").value;state.query=value;$("#resource-search").value=value;if(state.catalog)renderResources();$("#kutuphane").scrollIntoView({behavior:SMOOTH,block:"start"});$("#resource-search").focus({preventScroll:true});});
 $("#resource-search").addEventListener("input",event=>{$("#hero-search").value=event.target.value;});
 const toggle=$(".mobile-menu-toggle");const menu=$("#mobile-nav");
 toggle.addEventListener("click",()=>{const expanded=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",expanded?"false":"true");menu.hidden=expanded;});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){menu.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus();}});
 menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{menu.hidden=true;toggle.setAttribute("aria-expanded","false");}));
}
async function init(){
 $("#current-year").textContent=String(new Date().getFullYear());bindUI();
 try{
  const response=await fetch("data/catalog.json",{cache:"no-cache"});if(!response.ok)throw new Error("Katalog yüklenemedi: "+response.status);
  state.catalog=await response.json();
  appendOptions($("#filter-category"),categories(),"id","title");
  appendOptions($("#filter-type"),(state.catalog.filters||{}).types||[],"value","label");
  appendOptions($("#filter-grade"),(state.catalog.filters||{}).grades||[],"value","label");
  appendOptions($("#filter-subject"),(state.catalog.filters||{}).subjects||[],"value","label");
  renderCategories();renderResources();
 }catch(error){
  console.error(error);$("#category-list").textContent="Kategoriler yüklenemedi. Sayfayı yenilemeyi dene.";
  $("#resource-list").textContent=location.protocol==="file:"?"Dosyayı doğrudan açtığında katalog okunamaz. Klasörde `python -m http.server 8000` çalıştırıp localhost:8000 adresini aç.":"Kaynak listesi şu an yüklenemiyor.";$("#result-summary").textContent="Yükleme başarısız";
 }
}
document.addEventListener("DOMContentLoaded",init);
})();