let outcomes=[];
let uploadedOutcomes=[];
let searchIndex=[];
let fileStatus=new Map();

let latestLimit=5;
let archiveLimit=5;
let resultsLimit=20;

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
const resultsMore=$("#resultsMore");

const emptyState=$("#emptyState");
const loadingState=$("#loadingState");
const clearFilters=$("#clearFilters");

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

const escapeHtml=value=>
  String(value??"").replace(/[&<>"]/g,char=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;"
  }[char]));

const normalizeText=value=>
  String(value??"")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g," ");

const normalizeCode=value=>
  String(value??"")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9]/g,"");

const getData=item=>({
  code:item.id||"",
  grade:item.sinif||"",
  subject:item.ders||"",
  theme:item.tema||"",
  category:item.kategori||"",
  title:item.baslik||"",
  tags:Array.isArray(item.etiketler)?item.etiketler:[],
  file:item.dosyaYolu||""
});

function compareNatural(a,b){
  return String(a).localeCompare(
    String(b),
    "tr",
    {
      numeric:true,
      sensitivity:"base"
    }
  );
}

function uniqueValues(key,filters={}){
  return[
    ...new Set(
      uploadedOutcomes
        .filter(item=>{
          const d=getData(item);

          return Object.entries(filters).every(
            ([name,value])=>!value||d[name]===value
          );
        })
        .map(item=>getData(item)[key])
        .filter(Boolean)
    )
  ].sort(compareNatural);
}

function buildOptions(values,placeholder,selected=""){
  return[
    `<option value="">${placeholder}</option>`,
    ...values.map(value=>
      `<option value="${escapeHtml(value)}"${value===selected?" selected":""}>${escapeHtml(value)}</option>`
    )
  ].join("");
}

function closeMenus(){
  document.querySelectorAll(".filter-menu").forEach(menu=>{
    menu.hidden=true;

    menu
      .closest(".filter-select")
      ?.querySelector(".filter-trigger")
      ?.setAttribute("aria-expanded","false");
  });
}

function renderCustomFilters(){
  Object.entries(filterMap).forEach(([key,select])=>{
    const root=document.querySelector(
      `.filter-select[data-filter="${key}"]`
    );

    if(!root)return;

    const menu=root.querySelector(".filter-menu");
    const label=root.querySelector(".filter-value");
    const selected=select.value;

    label.textContent=
      select.options[select.selectedIndex]?.textContent||
      filterLabels[key];

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

function refreshFilters(){
  let grade=gradeFilter.value;
  let subject=subjectFilter.value;
  let theme=themeFilter.value;

  for(let i=0;i<3;i++){
    const grades=uniqueValues(
      "grade",
      {subject,theme}
    );

    if(grade&&!grades.includes(grade)){
      grade="";
    }

    const subjects=uniqueValues(
      "subject",
      {grade,theme}
    );

    if(subject&&!subjects.includes(subject)){
      subject="";
    }

    const themes=uniqueValues(
      "theme",
      {grade,subject}
    );

    if(theme&&!themes.includes(theme)){
      theme="";
    }
  }

  gradeFilter.innerHTML=buildOptions(
    uniqueValues(
      "grade",
      {subject,theme}
    ),
    "Tüm sınıflar",
    grade
  );

  subjectFilter.innerHTML=buildOptions(
    uniqueValues(
      "subject",
      {grade,theme}
    ),
    "Tüm dersler",
    subject
  );

  themeFilter.innerHTML=buildOptions(
    uniqueValues(
      "theme",
      {grade,subject}
    ),
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
    const d=getData(item);

    return{
      item,
      code:normalizeText(d.code),
      compactCode:normalizeCode(d.code),
      grade:d.grade,
      subject:d.subject,
      theme:d.theme,
      category:d.category,
      title:normalizeText(d.title),
      tags:d.tags.map(normalizeText),
      searchText:normalizeText([
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

function scoreResult(entry,query,compactQuery){
  if(!query)return 0;

  let score=0;

  if(
    compactQuery&&
    entry.compactCode===compactQuery
  ){
    score+=1200;
  }else if(
    compactQuery&&
    entry.compactCode.startsWith(compactQuery)
  ){
    score+=1100;
  }else if(
    compactQuery&&
    entry.compactCode.includes(compactQuery)
  ){
    score+=1000;
  }

  if(entry.code===query){
    score+=950;
  }else if(entry.code.startsWith(query)){
    score+=900;
  }else if(entry.code.includes(query)){
    score+=850;
  }

  if(entry.title===query){
    score+=800;
  }else if(entry.title.startsWith(query)){
    score+=700;
  }else if(entry.title.includes(query)){
    score+=600;
  }

  if(entry.tags.some(tag=>tag===query)){
    score+=550;
  }else if(entry.tags.some(tag=>tag.startsWith(query))){
    score+=500;
  }else if(entry.tags.some(tag=>tag.includes(query))){
    score+=450;
  }

  const theme=normalizeText(entry.theme);
  const category=normalizeText(entry.category);
  const subject=normalizeText(entry.subject);
  const grade=normalizeText(entry.grade);

  if(theme===query){
    score+=300;
  }else if(theme.includes(query)){
    score+=250;
  }

  if(category===query){
    score+=225;
  }else if(category.includes(query)){
    score+=200;
  }

  if(subject===query){
    score+=150;
  }else if(subject.includes(query)){
    score+=125;
  }

  if(grade===query){
    score+=100;
  }else if(grade.includes(query)){
    score+=75;
  }

  return score;
}

function filtered(){
  const query=normalizeText(searchInput.value);
  const compactQuery=normalizeCode(searchInput.value);

  const isCodeSearch=
    compactQuery.length>=3 &&
    /\d/.test(compactQuery);

  const grade=gradeFilter.value;
  const subject=subjectFilter.value;
  const theme=themeFilter.value;

  return searchIndex
    .filter(entry=>{
      const textMatch=
        !query||
        entry.searchText.includes(query)||
        (
          isCodeSearch&&
          entry.compactCode.includes(compactQuery)
        );

      if(!textMatch)return false;
      if(grade&&entry.grade!==grade)return false;
      if(subject&&entry.subject!==subject)return false;
      if(theme&&entry.theme!==theme)return false;

      return true;
    })
    .map(entry=>({
      item:entry.item,
      score:scoreResult(
        entry,
        query,
        isCodeSearch?compactQuery:""
      )
    }))
    .sort((a,b)=>
      b.score-a.score||
      compareNatural(
        getData(a.item).code,
        getData(b.item).code
      )
    )
    .map(entry=>entry.item);
}

function highlightText(text,query){
  const safe=escapeHtml(text);
  const q=String(query??"").trim();

  if(q.length<2)return safe;

  const pattern=q.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  try{
    return safe.replace(
      new RegExp(pattern,"gi"),
      match=>`<mark>${match}</mark>`
    );
  }catch{
    return safe;
  }
}

function card(item){
  const d=getData(item);

  return`
    <article class="card">
      <div class="meta">
        <span class="tag">${escapeHtml(d.grade)}</span>
        <span class="tag">${escapeHtml(d.subject)}</span>
        ${d.theme?`<span class="tag">${escapeHtml(d.theme)}</span>`:""}
      </div>

      <h3>${escapeHtml(d.title)}</h3>

      <div class="card-foot">
        ${
          d.file
            ? `<a class="download" href="${escapeHtml(d.file)}" download>Dosyayı İndir</a>`
            : `<span class="download is-error">Dosya yok</span>`
        }
      </div>
    </article>
  `;
}

function renderGrid(target,list){
  target.innerHTML=list.map(card).join("");
}

function resultRow(item){
  const d=getData(item);
  const query=searchInput.value.trim();
  const compactQuery=normalizeCode(query);

  const codeMatch=
    compactQuery.length>=3&&
    /\d/.test(compactQuery)&&
    normalizeCode(d.code).includes(compactQuery);

  return`
    <tr>
      <td>${escapeHtml(d.grade)}</td>

      <td>${escapeHtml(d.subject)}</td>

      <td>${escapeHtml(d.theme)}</td>

      <td>
        <span class="result-code${codeMatch?" code-match":""}">
          ${escapeHtml(d.code)}
        </span>
      </td>

      <td>
        <div class="result-title">
          ${highlightText(d.title,query)}
        </div>

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
  resultsBody.innerHTML=
    list
      .slice(0,resultsLimit)
      .map(resultRow)
      .join("");
}

async function checkFile(path){
  if(!path)return false;

  if(fileStatus.has(path)){
    return fileStatus.get(path);
  }

  let exists=false;

  try{
    const head=await fetch(
      path,
      {
        method:"HEAD",
        cache:"no-cache"
      }
    );

    exists=head.ok;

    if(!exists){
      const get=await fetch(
        path,
        {
          method:"GET",
          headers:{
            Range:"bytes=0-0"
          },
          cache:"no-cache"
        }
      );

      exists=get.ok;
    }
  }catch{
    try{
      const get=await fetch(
        path,
        {
          method:"GET",
          headers:{
            Range:"bytes=0-0"
          },
          cache:"no-cache"
        }
      );

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
      const d=getData(item);

      if(await checkFile(d.file)){
        valid.push(item);
      }
    }
  }

  await Promise.all(
    Array.from(
      {
        length:Math.min(
          concurrency,
          list.length
        )
      },
      ()=>worker()
    )
  );

  return valid;
}

function setLoading(value){
  loadingState.hidden=!value;

  document
    .querySelector(".content-columns")
    .hidden=value;

  if(value){
    resultsSection.hidden=true;
    emptyState.hidden=true;
  }
}

function render(){
  const active=Boolean(
    searchInput.value.trim()||
    gradeFilter.value||
    subjectFilter.value||
    themeFilter.value
  );

  const latestSource=[
    ...uploadedOutcomes
  ].reverse();

  const archiveSource=[
    ...uploadedOutcomes
  ].sort((a,b)=>{
    const x=getData(a);
    const y=getData(b);

    return(
      compareNatural(x.grade,y.grade)||
      compareNatural(x.subject,y.subject)||
      compareNatural(x.theme,y.theme)||
      compareNatural(x.code,y.code)
    );
  });

  const latest=latestSource.slice(0,latestLimit);
  const archive=archiveSource.slice(0,archiveLimit);
  const results=filtered();

  renderGrid(
    latestGrid,
    latest
  );

  renderGrid(
    allGrid,
    archive
  );

  latestCount.textContent=
    `${uploadedOutcomes.length} paket`;

  allCount.textContent=
    `${uploadedOutcomes.length} paket`;

  latestMore.hidden=
    latestLimit>=latestSource.length;

  allMore.hidden=
    archiveLimit>=archiveSource.length;

  latestMore.textContent=
    latestLimit>=latestSource.length
      ? "Daha Fazla"
      : `Daha Fazla`;

  allMore.textContent=
    archiveLimit>=archiveSource.length
      ? "Daha Fazla"
      : `Daha Fazla`;

  if(active){
    latestSection.hidden=true;
    allSection.hidden=true;

    resultsSection.hidden=false;

    resultsCount.textContent=
      `${results.length} sonuç`;

    renderResults(results);

    resultsTableWrap.hidden=
      results.length===0;

    resultsMore.hidden=
      results.length<=resultsLimit;

    emptyState.hidden=
      results.length>0;

    if(results.length===0){
      emptyState.querySelector("h2").textContent=
        "Sonuç bulunamadı.";

      emptyState.querySelector("p").textContent=
        "Arama metnini veya filtreleri değiştirerek tekrar deneyin.";
    }
  }else{
    latestSection.hidden=false;
    allSection.hidden=false;
    resultsSection.hidden=true;
    resultsMore.hidden=true;
    emptyState.hidden=true;
  }

  clearFilters.hidden=
    !(
      gradeFilter.value||
      subjectFilter.value||
      themeFilter.value
    );
}

async function init(){
  try{
    setLoading(true);

    const response=await fetch(
      "data/outcomes.json",
      {
        cache:"no-cache"
      }
    );

    if(!response.ok){
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const json=await response.json();

    outcomes=
      Array.isArray(json)
        ? json.filter(
            item=>item&&typeof item==="object"
          )
        : [];

    const withFiles=outcomes.filter(
      item=>getData(item).file
    );

    uploadedOutcomes=
      await verifyUploadedFiles(withFiles);

    buildSearchIndex();
    refreshFilters();

    setLoading(false);
    render();
  }catch(error){
    outcomes=[];
    uploadedOutcomes=[];
    searchIndex=[];

    setLoading(false);
    refreshFilters();
    render();

    latestGrid.innerHTML="";
    allGrid.innerHTML="";
    resultsSection.hidden=true;

    emptyState.hidden=false;

    emptyState.querySelector("h2").textContent=
      "Kazanım listesi yüklenemedi.";

    emptyState.querySelector("p").textContent=
      "Veri dosyası veya site bağlantısını kontrol edin.";

    console.error(error);
  }
}

searchInput.addEventListener(
  "input",
  ()=>{
    resultsLimit=20;
    render();
  }
);

[gradeFilter,subjectFilter,themeFilter].forEach(
  select=>{
    select.addEventListener(
      "change",
      ()=>{
        resultsLimit=20;
        refreshFilters();
        render();
      }
    );
  }
);

clearFilters.addEventListener(
  "click",
  ()=>{
    gradeFilter.value="";
    subjectFilter.value="";
    themeFilter.value="";
    resultsLimit=20;
    refreshFilters();
    render();
  }
);

latestMore.addEventListener(
  "click",
  ()=>{
    latestLimit+=5;
    render();
  }
);

allMore.addEventListener(
  "click",
  ()=>{
    archiveLimit+=5;
    render();
  }
);

resultsMore.addEventListener(
  "click",
  ()=>{
    resultsLimit+=20;
    render();
  }
);

document.addEventListener(
  "click",
  event=>{
    const option=
      event.target.closest(".filter-option");

    const trigger=
      event.target.closest(".filter-trigger");

    if(option){
      const root=
        option.closest(".filter-select");

      const key=root?.dataset.filter;
      const select=filterMap[key];

      if(select){
        select.value=option.dataset.value;
        closeMenus();
        resultsLimit=20;
        refreshFilters();
        render();
      }

      return;
    }

    if(trigger){
      const root=
        trigger.closest(".filter-select");

      const menu=
        root.querySelector(".filter-menu");

      const wasOpen=!menu.hidden;

      closeMenus();

      if(!wasOpen){
        menu.hidden=false;

        trigger.setAttribute(
          "aria-expanded",
          "true"
        );

        menu
          .querySelector('[aria-selected="true"]')
          ?.focus();
      }

      return;
    }

    if(!event.target.closest(".filter-select")){
      closeMenus();
    }
  }
);

document.addEventListener(
  "keydown",
  event=>{
    if(event.key==="Escape"){
      closeMenus();
    }
  }
);

document.addEventListener(
  "click",
  async event=>{
    const link=
      event.target.closest("a[download]");

    if(
      !link||
      link.dataset.ready==="1"||
      link.classList.contains("is-error")
    ){
      return;
    }

    event.preventDefault();

    if(link.dataset.checking==="1"){
      return;
    }

    link.dataset.checking="1";

    const original=link.textContent;

    link.textContent=
      "Kontrol ediliyor...";

    try{
      const exists=
        await checkFile(
          link.getAttribute("href")
        );

      if(!exists){
        link.textContent=
          "Dosya bulunamadı";

        link.classList.add("is-error");

        return;
      }

      link.dataset.ready="1";
      link.click();
    }catch{
      link.textContent=
        "Dosya kontrol edilemedi";

      link.classList.add("is-error");
    }finally{
      delete link.dataset.checking;

      if(link.dataset.ready==="1"){
        link.textContent=original;
      }
    }
  }
);

init();
