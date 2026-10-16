(function(){
"use strict";
const $=(selector,parent)=> (parent||document).querySelector(selector);
const state={catalog:null,query:"",category:"",type:"",grade:"",subject:""};
const labels={
types:{"performans-gorevi":"Performans görevi","rubrik":"Rubrik","gozlem-formu":"Gözlem formu","portfolyo":"Portfolyo / gelişim dosyası","etkinlik":"Etkinlik","calisma-kagidi":"Çalışma kâğıdı","oz-akran-degerlendirme":"Öz / akran değerlendirme","kilavuz":"Kılavuz","diger":"Diğer"},
grades:{"okul-oncesi":"Okul öncesi","ilkokul":"İlkokul (1–4)","ortaokul":"Ortaokul (5–8)","lise":"Lise (9–12)","tum-duzeyler":"Tüm düzeyler"},
formats:{"PDF":"PDF","DOCX":"Word","XLSX":"Excel","PPTX":"PowerPoint","LINK":"Bağlantı","HTML":"Web","OTHER":"Diğer"}
};
function normalize(value){return String(value==null?"":value).toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").trim();}
function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function labelFor(map,value){return map[value]||value||"";}
function addOptions(select,items,valueKey,labelKey){items.forEach(item=>{const option=document.createElement("option");option.value=item[valueKey];option.textContent=item[labelKey];select.appendChild(option);});}
function renderCategories(){
 const holder=$("#category-grid");const categories=state.catalog.categories||[];holder.innerHTML="";
 categories.forEach((category,index)=>{
  const button=document.createElement("button");button.type="button";button.className="category-card"+(state.category===category.id?" is-active":"");button.setAttribute("aria-pressed",state.category===category.id?"true":"false");button.setAttribute("data-category",category.id);
  button.innerHTML='<div class="category-card-top"><span class="category-symbol" aria-hidden="true">'+escapeHtml(category.symbol||"◇")+'</span><span class="category-number">'+String(index+1).padStart(2,"0")+'</span></div><h4>'+escapeHtml(category.title)+'</h4><p>'+escapeHtml(category.description)+'</p><span class="category-card-bottom"><span>Kategoriyi keşfet</span><span class="category-arrow" aria-hidden="true">↗</span></span>';
  button.addEventListener("click",()=>{state.category=state.category===category.id?"":category.id;$("#filter-category").value=state.category;renderCategories();renderResources();$("#results").scrollIntoView({behavior:"smooth",block:"start"});});
  holder.appendChild(button);
 });
}
function hasFilters(){return Boolean(state.query||state.category||state.type||state.grade||state.subject);}
function getFilteredResources(){
 const resources=Array.isArray(state.catalog.resources)?state.catalog.resources:[];const categoryById=new Map((state.catalog.categories||[]).map(category=>[category.id,category.title]));const query=normalize(state.query);
 return resources.filter(resource=>{
  if(resource.status&&resource.status!=="published")return false;
  if(state.category&&resource.categoryId!==state.category)return false;
  if(state.type&&resource.type!==state.type)return false;
  if(state.grade&&!(resource.grades||[]).includes(state.grade)&&!(resource.grades||[]).includes("tum-duzeyler"))return false;
  if(state.subject&&!(resource.subjects||[]).some(subject=>normalize(subject)===normalize(state.subject)||normalize(subject)==="tum dersler"))return false;
  const searchable=[resource.title,resource.summary,resource.type,resource.categoryId,categoryById.get(resource.categoryId),(resource.tags||[]).join(" "),(resource.grades||[]).map(grade=>labelFor(labels.grades,grade)).join(" "),(resource.subjects||[]).join(" ")].join(" ");
  return !query||normalize(searchable).includes(query);
 });
}
function setCount(count,total){$("#resource-count").textContent=total?total+" kaynak":"Katalog hazır · içerik bekleniyor";$("#result-summary").textContent=total?count+" / "+total+" kaynak gösteriliyor":"Henüz kaynak eklenmedi";}
function renderResources(){
 const allResources=Array.isArray(state.catalog.resources)?state.catalog.resources.filter(item=>!item.status||item.status==="published"):[];const resources=getFilteredResources();const holder=$("#resource-grid");holder.innerHTML="";setCount(resources.length,allResources.length);$("#clear-filters").hidden=!hasFilters();
 if(!allResources.length){holder.innerHTML='<div class="empty-state"><span class="empty-state-mark" aria-hidden="true">m.</span><h4>Kütüphane ilk kaynaklarını bekliyor.</h4><p>Kategori yapısı ve arama altyapısı hazır. Kaynak dosyalarını <code>content/</code> klasörüne ekleyip <code>data/catalog.json</code> içinde tanımladığında burada listelenecekler.</p></div>';return;}
 if(!resources.length){holder.innerHTML='<div class="empty-state"><span class="empty-state-mark" aria-hidden="true">⌕</span><h4>Bu ölçütlerle eşleşen kaynak yok.</h4><p>Arama sözcüğünü değiştirmeyi veya bazı filtreleri kaldırmayı dene.</p><button type="button" class="button button-primary reset-inline" id="reset-inline">Filtreleri temizle <span aria-hidden="true">×</span></button></div>';$("#reset-inline").addEventListener("click",clearFilters);return;}
 resources.forEach(resource=>{
  const category=(state.catalog.categories||[]).find(item=>item.id===resource.categoryId);const grades=(resource.grades||[]).map(grade=>labelFor(labels.grades,grade));const subject=(resource.subjects||[]).slice(0,2).join(", ");const format=labelFor(labels.formats,resource.format);const type=labelFor(labels.types,resource.type);
  const link=resource.sourceType==="external"&&resource.sourceUrl?resource.sourceUrl:resource.file;const isExternal=Boolean(link&&(link.startsWith("https://")||link.startsWith("http://")));const safePath=Boolean(link&&link.startsWith("content/")&&link.split("/").every(segment=>segment&&segment!=="."&&segment!==".."&&/^[a-zA-Z0-9._-]+$/.test(segment)));const safeLink=link&&(isExternal||safePath)?link:"";
  const article=document.createElement("article");article.className="resource-card";
  article.innerHTML='<div class="resource-topline"><span class="resource-type">'+escapeHtml(type)+'</span><span class="resource-format">'+escapeHtml(format)+'</span></div><h4>'+escapeHtml(resource.title)+'</h4><p class="resource-summary">'+escapeHtml(resource.summary)+'</p><div class="resource-meta">'+(category?'<span class="meta-pill">'+escapeHtml(category.title)+'</span>':"")+grades.slice(0,2).map(grade=>'<span class="meta-pill">'+escapeHtml(grade)+'</span>').join("")+(subject?'<span class="meta-pill">'+escapeHtml(subject)+'</span>':"")+'</div>'+(safeLink?'<a class="resource-open" href="'+escapeHtml(safeLink)+'"'+(isExternal?' target="_blank" rel="noopener noreferrer"':" download")+'><span>'+(isExternal?"Kaynağı aç":"Dosyayı görüntüle")+'</span><span aria-hidden="true">↗</span></a>':'<span class="resource-open"><span>Dosya bağlantısı eklenmemiş</span><span aria-hidden="true">—</span></span>');
  holder.appendChild(article);
 });
}
function clearFilters(){state.query="";state.category="";state.type="";state.grade="";state.subject="";$("#resource-search").value="";$("#filter-category").value="";$("#filter-type").value="";$("#filter-grade").value="";$("#filter-subject").value="";renderCategories();renderResources();}
function bindFilters(){
 $("#resource-search").addEventListener("input",event=>{state.query=event.target.value;renderResources();});
 $("#filter-category").addEventListener("change",event=>{state.category=event.target.value;renderCategories();renderResources();});
 $("#filter-type").addEventListener("change",event=>{state.type=event.target.value;renderResources();});
 $("#filter-grade").addEventListener("change",event=>{state.grade=event.target.value;renderResources();});
 $("#filter-subject").addEventListener("change",event=>{state.subject=event.target.value;renderResources();});
 $("#clear-filters").addEventListener("click",clearFilters);
 const menuButton=$(".mobile-menu-toggle");const mobileNav=$("#mobile-nav");
 menuButton.addEventListener("click",()=>{const expanded=menuButton.getAttribute("aria-expanded")==="true";menuButton.setAttribute("aria-expanded",expanded?"false":"true");mobileNav.hidden=expanded;});
 mobileNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobileNav.hidden=true;menuButton.setAttribute("aria-expanded","false");}));
}
async function init(){
 $("#current-year").textContent=String(new Date().getFullYear());bindFilters();
 try{
  const response=await fetch("data/catalog.json",{cache:"no-cache"});if(!response.ok)throw new Error("Katalog dosyası okunamadı ("+response.status+").");state.catalog=await response.json();
  addOptions($("#filter-category"),state.catalog.categories||[],"id","title");addOptions($("#filter-type"),(state.catalog.filters||{}).types||[],"value","label");addOptions($("#filter-grade"),(state.catalog.filters||{}).grades||[],"value","label");addOptions($("#filter-subject"),(state.catalog.filters||{}).subjects||[],"value","label");
  renderCategories();renderResources();
 }catch(error){console.error(error);$("#category-grid").innerHTML='<div class="empty-state"><h4>Katalog yüklenemedi.</h4><p>Siteyi yerel HTTP sunucusu üzerinden açtığını ve <code>data/catalog.json</code> dosyasının bulunduğunu kontrol et.</p></div>';$("#resource-grid").innerHTML="";$("#resource-count").textContent="Katalog okunamadı";$("#result-summary").textContent="Kurulum kontrol edilmeli";}
}
document.addEventListener("DOMContentLoaded",init);
})();