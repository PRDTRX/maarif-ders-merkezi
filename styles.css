let outcomes=[];
let uploadedOutcomes=[];
let searchIndex=[];
let latestExpanded=false;
let archiveExpanded=false;
let fileStatus=new Map();

const $=selector=>document.querySelector(selector);

const gradeFilter=$("#gradeFilter");
const subjectFilter=$("#subjectFilter");
const themeFilter=$("#themeFilter");
const searchInput=$("#searchInput");

const latestSection=$("#latestSection");
const latestGrid=$("#latestGrid");
const latestCount=$("#latestCount");
const latestMore=$("#latestMore");

const allSection=$("#allSection");
const allGrid=$("#allGrid");
const allCount=$("#allCount");
const allMore=$("#allMore");

const resultsSection=$("#resultsSection");
const resultsBody=$("#resultsBody");
const resultsCount=$("#resultsCount");
const resultsTableWrap=$("#resultsTableWrap");

const emptyState=$("#emptyState");

const escapeHtml=value=>String(value??"").replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));

const normalize=value=>String(value??"").trim().toLocaleLowerCase("tr-TR");

const data=item=>({
  code:item.id||"",
  grade:item.sinif||"",
  subject:item.ders||"",
  theme:item.tema||"",
  category:item.kategori||"",
  title:item.baslik||"",
  tags:Array.isArray(item.etiketler)?item.etiketler:[],
  file:item.dosyaYolu||""
});

const filterMap={
  grade:gradeFilter,
  subject:subjectFilter,
  theme:themeFilter
};

const filterLabels={
  grade:"Tüm sınıflar",
  subject:"Tüm dersler",
  theme:"Tüm temalar"
};

function compareNatural(a,b){
  return String(a).localeCompare(String(b),"tr",{numeric:true,sensitivity:"base"});
}

function sortArchive(list){
  return [...list].sort((a,b)=>{
    const x=data(a);
    const y=data(b);
    return compareNatural(x.grade,y.grade)||
      compareNatural(x.subject,y.subject)||
      compareNatural(x.theme,y.theme)||
      compareNatural(x.code,y.code);
  });
}

function uniqueValues(key,filters={}){
  return [...new Set(
    uploadedOutcomes
      .filter(item=>{
        const d=data(item);
        return Object.entries(filters).every(([name,value])=>!value||d[name]===value);
      })
      .map(item=>data(item)[key])
      .filter(Boolean)
  )].sort(compareNatural);
}

function buildOptions(values,placeholder,selected=""){
  return [
    `<option value="">${placeholder}</option>`,
    ...values.map(value=>
      `<option value="${escapeHtml(value)}"${value===selected?" selected":""}>${escapeHtml(value)}</option>`
    )
  ].join("");
}

function renderCustomFilters(){
  Object.entries(filterMap).forEach(([key,select])=>{
    const root=document.querySelector(`.filter-select[data-filter="${key}"]`);
    if(!root)return;

    const menu=root.querySelector(".filter-menu");
    const label=root.querySelector(".filter-value");
    const selected=select.value;

    label.textContent=select.options[select.selectedIndex]?.textContent||filterLabels[key];

    menu.innerHTML=[...select.options].map(option=>`
      <button
        type="button"
        class="filter-option"
        role="option"
        aria-selected="${option.value===selected}"
        data-value="${escapeHtml(option.value)}">
        <span>${escapeHtml(option.textContent)}</span>
      </button>
    `).join("");
  });
}

function closeMenus(){
  document.querySelectorAll(".filter-menu").forEach(menu=>{
    menu.hidden=true;
    menu.closest(".filter-select")
      ?.querySelector(".filter-trigger")
      ?.setAttribute("aria-expanded","false");
  });
}

function refreshFilters(){
  let grade=gradeFilter.value;
  let subject=subjectFilter.value;
  let theme=themeFilter.value;

  for(let i=0;i<3;i++){
    const grades=uniqueValues("grade",{subject,theme});
    if(grade&&!grades.includes(grade))grade="";

    const subjects=uniqueValues("subject",{grade,theme});
    if(subject&&!subjects.includes(subject))subject="";

    const themes=uniqueValues("theme",{grade,subject});
    if(theme&&!themes.includes(theme))theme="";
  }

  gradeFilter.innerHTML=buildOptions(
    uniqueValues("grade",{subject,theme}),
    "Tüm sınıflar",
    grade
  );

  subjectFilter.innerHTML=buildOptions(
    uniqueValues("subject",{grade,theme}),
    "Tüm dersler",
    subject
  );

  themeFilter.innerHTML=buildOptions(
    uniqueValues("theme",{grade,subject}),
    "Tüm temalar",
    theme
  );

  gradeFilter.value=grade;
  subjectFilter.value=subject;
  themeFilter.value=theme;

  renderCustomFilters();
}

function buildSearchIndex(){
  searchIndex=uploadedOutcomes.map(item=>{
    const d=data(item);

    return{
      item,
      code:normalize(d.code),
      grade:d.grade,
      subject:d.subject,
      theme:d.theme,
      category:d.category,
      title:normalize(d.title),
      tags:d.tags.map(normalize),
      searchText:normalize([
        d.code,
        d.grade,
        d.subject,
        d.theme,
        d.category,
        d.title,
        ...d.tags
      ].join(" "))
    };
  });
}

function scoreResult(entry,q){
  if(!q)return 0;

  let score=0;

  if(entry.code===q)score+=1000;
  else if(entry.code.startsWith(q))score+=900;
  else if(entry.code.includes(q))score+=800;

  if(entry.title===q)score+=750;
  else if(entry.title.startsWith(q))score+=700;
  else if(entry.title.includes(q))score+=600;

  if(entry.tags.some(tag=>tag===q))score+=550;
  else if(entry.tags.some(tag=>tag.startsWith(q)))score+=500;
  else if(entry.tags.some(tag=>tag.includes(q)))score+=450;

  const theme=normalize(entry.theme);
  const category=normalize(entry.category);
  const subject=normalize(entry.subject);
  const grade=normalize(entry.grade);

  if(theme===q)score+=300;
  else if(theme.includes(q))score+=250;

  if(category===q)score+=225;
  else if(category.includes(q))score+=200;

  if(subject===q)score+=150;
  else if(subject.includes(q))score+=125;

  if(grade===q)score+=100;
  else if(grade.includes(q))score+=75;

  return score;
}

function filtered(){
  const q=normalize(searchInput.value);
  const grade=gradeFilter.value;
  const subject=subjectFilter.value;
  const theme=themeFilter.value;

  return searchIndex
    .filter(entry=>{
      if(q&&!entry.searchText.includes(q))return false;
      if(grade&&entry.grade!==grade)return false;
      if(subject&&entry.subject!==subject)return false;
      if(theme&&entry.theme!==theme)return false;
      return true;
    })
    .map(entry=>({
      item:entry.item,
      score:scoreResult(entry,q)
    }))
    .sort((a,b)=>
      b.score-a.score||
      compareNatural(data(a.item).code,data(b.item).code)
    )
    .map(entry=>entry.item);
}

function card(item){
  const d=data(item);

  return`
    <article class="card">
      <div class="meta">
        <span class="tag">${escapeHtml(d.grade)}</span>
        <span class="tag">${escapeHtml(d.subject)}</span>
        ${d.theme?`<span class="tag">${escapeHtml(d.theme)}</span>`:""}
      </div>

      <h3>${escapeHtml(d.title)}</h3>

      <div class="card-foot">
        <a class="download" href="${escapeHtml(d.file)}" download>
          Dosyayı İndir
        </a>
      </div>
    </article>
  `;
}

function renderGrid(target,list){
  target.innerHTML=list.map(card).join("");
}

function resultRow(item){
  const d=data(item);

  return`
    <tr>
      <td>${escapeHtml(d.grade)}</td>
      <td>${escapeHtml(d.subject)}</td>
      <td>${escapeHtml(d.theme)}</td>

      <td>
        <span class="result-code">${escapeHtml(d.code)}</span>
      </td>

      <td>
        <div class="result-title">${escapeHtml(d.title)}</div>
        ${
          d.tags.length
            ? `<div class="result-tags">
                ${d.tags.slice(0,5).map(tag=>
                  `<span class="result-tag">#${escapeHtml(tag)}</span>`
                ).join("")}
              </div>`
            : ""
        }
      </td>

      <td>
        ${
          d.file
            ? `<a class="result-download" href="${escapeHtml(d.file)}" download>Dosyayı İndir</a>`
            : `<span class="result-download is-error">Dosya yok</span>`
        }
      </td>
    </tr>
  `;
}

function renderResults(list){
  resultsBody.innerHTML=list.map(resultRow).join("");
}

async function checkFile(path){
  if(!path)return false;

  if(fileStatus.has(path))return fileStatus.get(path);

  let exists=false;

  try{
    const head=await fetch(path,{
      method:"HEAD",
      cache:"no-cache"
    });

    exists=head.ok;

    if(!exists){
      const get=await fetch(path,{
        method:"GET",
        headers:{Range:"bytes=0-0"},
        cache:"no-cache"
      });

      exists=get.ok;
    }
  }catch{
    try{
      const get=await fetch(path,{
        method:"GET",
        headers:{Range:"bytes=0-0"},
        cache:"no-cache"
      });

      exists=get.ok;
    }catch{
      exists=false;
    }
  }

  fileStatus.set(path,exists);
  return exists;
}

async function verifyUploadedFiles(list){
  const valid=[];
  const concurrency=6;
  let cursor=0;

  async function worker(){
    while(cursor<list.length){
      const index=cursor++;
      const item=list[index];
      const d=data(item);

      if(await checkFile(d.file)){
        valid.push(item);
      }
    }
  }

  await Promise.all(
    Array.from(
      {length:Math.min(concurrency,list.length)},
      ()=>worker()
    )
  );

  return valid;
}

function render(){
  const active=Boolean(
    searchInput.value.trim()||
    gradeFilter.value||
    subjectFilter.value||
    themeFilter.value
  );

  const latestSource=[...uploadedOutcomes].reverse();

  const latest=latestExpanded
    ? latestSource
    : latestSource.slice(0,5);

  const archiveSource=sortArchive(uploadedOutcomes);

  const archive=archiveExpanded
    ? archiveSource
    : archiveSource.slice(0,5);

  const results=filtered();

  renderGrid(latestGrid,latest);
  renderGrid(allGrid,archive);

  latestCount.textContent=`${uploadedOutcomes.length} paket`;
  allCount.textContent=`${uploadedOutcomes.length} paket`;

  latestMore.hidden=uploadedOutcomes.length<=5;
  allMore.hidden=uploadedOutcomes.length<=5;

  latestMore.textContent=latestExpanded?"Daha Az":"Daha Fazla";
  allMore.textContent=archiveExpanded?"Daha Az":"Daha Fazla";

  if(active){
    latestSection.hidden=true;
    allSection.hidden=true;

    resultsSection.hidden=false;

    resultsCount.textContent=`${results.length} sonuç`;

    renderResults(results);

    resultsTableWrap.hidden=results.length===0;
    emptyState.hidden=results.length>0;

    if(results.length===0){
      emptyState.querySelector("h2").textContent="Sonuç bulunamadı.";
      emptyState.querySelector("p").textContent="Arama metnini veya filtreleri değiştirerek tekrar deneyin.";
    }
  }else{
    latestSection.hidden=false;
    allSection.hidden=false;
    resultsSection.hidden=true;
    emptyState.hidden=true;
  }
}

async function init(){
  try{
    const response=await fetch("data/outcomes.json",{
      cache:"no-cache"
    });

    if(!response.ok){
      throw new Error(`HTTP ${response.status}`);
    }

    outcomes=await response.json();

    if(!Array.isArray(outcomes)){
      outcomes=[];
    }

    const withPath=outcomes.filter(item=>data(item).file);

    uploadedOutcomes=await verifyUploadedFiles(withPath);

    buildSearchIndex();
    refreshFilters();
    render();
  }catch(error){
    outcomes=[];
    uploadedOutcomes=[];
    searchIndex=[];

    refreshFilters();
    render();

    latestGrid.innerHTML="";
    allGrid.innerHTML="";

    emptyState.hidden=false;

    emptyState.querySelector("h2").textContent=
      "Kazanım listesi yüklenemedi.";

    emptyState.querySelector("p").textContent=
      "data/outcomes.json dosyasını kontrol edin.";

    console.error(error);
  }
}

searchInput.addEventListener("input",render);

[gradeFilter,subjectFilter,themeFilter].forEach(select=>{
  select.addEventListener("change",()=>{
    refreshFilters();
    render();
  });
});

document.addEventListener("click",event=>{
  const option=event.target.closest(".filter-option");
  const trigger=event.target.closest(".filter-trigger");

  if(option){
    const root=option.closest(".filter-select");
    const key=root?.dataset.filter;
    const select=filterMap[key];

    if(select){
      select.value=option.dataset.value;
      closeMenus();
      refreshFilters();
      render();
    }

    return;
  }

  if(trigger){
    const root=trigger.closest(".filter-select");
    const menu=root.querySelector(".filter-menu");
    const wasOpen=!menu.hidden;

    closeMenus();

    if(!wasOpen){
      menu.hidden=false;
      trigger.setAttribute("aria-expanded","true");

      const selected=menu.querySelector('[aria-selected="true"]');

      if(selected){
        selected.focus();
      }
    }

    return;
  }

  if(!event.target.closest(".filter-select")){
    closeMenus();
  }
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeMenus();
  }
});

latestMore.addEventListener("click",()=>{
  latestExpanded=!latestExpanded;
  render();
});

allMore.addEventListener("click",()=>{
  archiveExpanded=!archiveExpanded;
  render();
});

document.addEventListener("click",async event=>{
  const link=event.target.closest("a[download]");

  if(
    !link||
    link.dataset.ready==="1"||
    link.classList.contains("is-error")
  ){
    return;
  }

  event.preventDefault();

  if(link.dataset.checking==="1")return;

  link.dataset.checking="1";

  const original=link.textContent;

  link.textContent="Kontrol ediliyor...";

  try{
    const exists=await checkFile(link.getAttribute("href"));

    if(!exists){
      link.textContent="Dosya bulunamadı";
      link.classList.add("is-error");
      return;
    }

    link.dataset.ready="1";
    link.click();
  }catch{
    link.textContent="Dosya kontrol edilemedi";
    link.classList.add("is-error");
  }finally{
    delete link.dataset.checking;

    if(link.dataset.ready==="1"){
      link.textContent=original;
    }
  }
});

init();
