let outcomes = [];
let searchIndex = [];

let latestExpanded = false;
let archiveExpanded = false;

let resultsLimit = 20;

const fileStatus = new Map();

const $ = selector => document.querySelector(selector);

const gradeFilter = $("#gradeFilter");
const subjectFilter = $("#subjectFilter");
const themeFilter = $("#themeFilter");
const searchInput = $("#searchInput");
const clearFilters = $("#clearFilters");

const latestSection = $("#latestSection");
const latestGrid = $("#latestGrid");
const latestCount = $("#latestCount");
const latestMore = $("#latestMore");

const allSection = $("#allSection");
const allGrid = $("#allGrid");
const allCount = $("#allCount");
const allMore = $("#allMore");

const resultsSection = $("#resultsSection");
const resultsBody = $("#resultsBody");
const resultsCount = $("#resultsCount");
const resultsTableWrap = $("#resultsTableWrap");
const resultsMore = $("#resultsMore");

const emptyState = $("#emptyState");

const filterMap = {
  grade: gradeFilter,
  subject: subjectFilter,
  theme: themeFilter
};

const filterLabels = {
  grade: "Tüm sınıflar",
  subject: "Tüm dersler",
  theme: "Tüm temalar"
};

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char])
  );
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

function normalizeCode(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9]/g, "");
}

function getData(item) {
  return {
    code: item?.id || "",
    grade: item?.sinif || "",
    subject: item?.ders || "",
    theme: item?.tema || "",
    category: item?.kategori || "",
    title: item?.baslik || "",
    tags: Array.isArray(item?.etiketler)
      ? item.etiketler
      : [],
    file: item?.dosyaYolu || ""
  };
}

function compareNatural(a, b) {
  return String(a).localeCompare(
    String(b),
    "tr",
    {
      numeric: true,
      sensitivity: "base"
    }
  );
}

function sortArchive(list) {
  return [...list].sort((a, b) => {
    const x = getData(a);
    const y = getData(b);

    return (
      compareNatural(x.grade, y.grade) ||
      compareNatural(x.subject, y.subject) ||
      compareNatural(x.theme, y.theme) ||
      compareNatural(x.code, y.code)
    );
  });
}

function uniqueValues(key, filters = {}) {
  return [
    ...new Set(
      outcomes
        .filter(item => {
          const d = getData(item);

          return Object.entries(filters).every(
            ([name, value]) =>
              !value || d[name] === value
          );
        })
        .map(item => getData(item)[key])
        .filter(Boolean)
    )
  ].sort(compareNatural);
}

function buildOptions(
  values,
  placeholder,
  selected = ""
) {
  return [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...values.map(value =>
      `<option value="${escapeHtml(value)}"${
        value === selected ? " selected" : ""
      }>${escapeHtml(value)}</option>`
    )
  ].join("");
}

function closeMenus() {
  document
    .querySelectorAll(".filter-menu")
    .forEach(menu => {
      menu.hidden = true;

      menu
        .closest(".filter-select")
        ?.querySelector(".filter-trigger")
        ?.setAttribute(
          "aria-expanded",
          "false"
        );
    });
}

function renderCustomFilters() {
  Object.entries(filterMap).forEach(
    ([key, select]) => {
      const root = document.querySelector(
        `.filter-select[data-filter="${key}"]`
      );

      if (!root) return;

      const menu =
        root.querySelector(".filter-menu");

      const label =
        root.querySelector(".filter-value");

      if (!menu || !label) return;

      const selected = select.value;

      label.textContent =
        select.options[
          select.selectedIndex
        ]?.textContent ||
        filterLabels[key];

      menu.innerHTML = [
        ...select.options
      ]
        .map(
          option => `
            <button
              type="button"
              class="filter-option"
              role="option"
              aria-selected="${
                option.value === selected
              }"
              data-value="${escapeHtml(
                option.value
              )}"
            >
              <span>
                ${escapeHtml(
                  option.textContent
                )}
              </span>
            </button>
          `
        )
        .join("");
    }
  );
}

function refreshFilters() {
  let grade = gradeFilter.value;
  let subject = subjectFilter.value;
  let theme = themeFilter.value;

  for (let i = 0; i < 3; i++) {
    const grades = uniqueValues(
      "grade",
      {
        subject,
        theme
      }
    );

    if (
      grade &&
      !grades.includes(grade)
    ) {
      grade = "";
    }

    const subjects = uniqueValues(
      "subject",
      {
        grade,
        theme
      }
    );

    if (
      subject &&
      !subjects.includes(subject)
    ) {
      subject = "";
    }

    const themes = uniqueValues(
      "theme",
      {
        grade,
        subject
      }
    );

    if (
      theme &&
      !themes.includes(theme)
    ) {
      theme = "";
    }
  }

  gradeFilter.innerHTML = buildOptions(
    uniqueValues(
      "grade",
      {
        subject,
        theme
      }
    ),
    "Tüm sınıflar",
    grade
  );

  subjectFilter.innerHTML = buildOptions(
    uniqueValues(
      "subject",
      {
        grade,
        theme
      }
    ),
    "Tüm dersler",
    subject
  );

  themeFilter.innerHTML = buildOptions(
    uniqueValues(
      "theme",
      {
        grade,
        subject
      }
    ),
    "Tüm temalar",
    theme
  );

  gradeFilter.value = grade;
  subjectFilter.value = subject;
  themeFilter.value = theme;

  renderCustomFilters();
}

function buildSearchIndex() {
  searchIndex = outcomes.map(item => {
    const d = getData(item);

    return {
      item,

      code: normalizeText(d.code),

      compactCode:
        normalizeCode(d.code),

      grade: d.grade,
      subject: d.subject,
      theme: d.theme,
      category: d.category,

      title: normalizeText(d.title),

      tags: d.tags.map(
        normalizeText
      ),

      searchText: normalizeText(
        [
          d.code,
          d.grade,
          d.subject,
          d.theme,
          d.category,
          d.title,
          ...d.tags
        ].join(" ")
      )
    };
  });
}

function scoreResult(
  entry,
  query,
  terms,
  compactQuery,
  isCodeSearch
) {
  if (!query) return 0;

  let score = 0;

  if (
    isCodeSearch &&
    entry.compactCode === compactQuery
  ) {
    score += 1500;
  }
  else if (
    isCodeSearch &&
    entry.compactCode.startsWith(
      compactQuery
    )
  ) {
    score += 1300;
  }
  else if (
    isCodeSearch &&
    entry.compactCode.includes(
      compactQuery
    )
  ) {
    score += 1100;
  }

  if (entry.code === query) {
    score += 1000;
  }
  else if (entry.code.startsWith(query)) {
    score += 900;
  }
  else if (entry.code.includes(query)) {
    score += 800;
  }

  if (entry.title === query) {
    score += 750;
  }
  else if (entry.title.startsWith(query)) {
    score += 700;
  }
  else if (entry.title.includes(query)) {
    score += 600;
  }

  if (
    entry.tags.some(
      tag => tag === query
    )
  ) {
    score += 550;
  }
  else if (
    entry.tags.some(
      tag => tag.startsWith(query)
    )
  ) {
    score += 500;
  }
  else if (
    entry.tags.some(
      tag => tag.includes(query)
    )
  ) {
    score += 450;
  }

  const theme =
    normalizeText(entry.theme);

  if (theme === query) {
    score += 300;
  }
  else if (theme.includes(query)) {
    score += 250;
  }

  const category =
    normalizeText(entry.category);

  if (category === query) {
    score += 225;
  }
  else if (category.includes(query)) {
    score += 200;
  }

  const subject =
    normalizeText(entry.subject);

  if (subject === query) {
    score += 150;
  }
  else if (subject.includes(query)) {
    score += 125;
  }

  const grade =
    normalizeText(entry.grade);

  if (grade === query) {
    score += 100;
  }
  else if (grade.includes(query)) {
    score += 75;
  }

  const matchedTerms =
    terms.filter(term =>
      entry.searchText.includes(term)
    ).length;

  score += matchedTerms * 60;

  return score;
}

function filtered() {
  const query =
    normalizeText(
      searchInput.value
    );

  const compactQuery =
    normalizeCode(
      searchInput.value
    );

  const terms =
    query
      ? query.split(/\s+/).filter(Boolean)
      : [];

  const isCodeSearch =
    compactQuery.length >= 3 &&
    /\d/.test(compactQuery);

  const grade =
    gradeFilter.value;

  const subject =
    subjectFilter.value;

  const theme =
    themeFilter.value;

  return searchIndex
    .filter(entry => {
      if (query) {

        const phraseMatch =
          entry.searchText.includes(
            query
          );

        const termMatch =
          terms.length > 1 &&
          terms.every(term =>
            entry.searchText.includes(
              term
            )
          );

        const codeMatch =
          isCodeSearch &&
          entry.compactCode.includes(
            compactQuery
          );

        if (
          !phraseMatch &&
          !termMatch &&
          !codeMatch
        ) {
          return false;
        }
      }

      if (
        grade &&
        entry.grade !== grade
      ) {
        return false;
      }

      if (
        subject &&
        entry.subject !== subject
      ) {
        return false;
      }

      if (
        theme &&
        entry.theme !== theme
      ) {
        return false;
      }

      return true;
    })
    .map(entry => ({
      item: entry.item,

      score: scoreResult(
        entry,
        query,
        terms,
        compactQuery,
        isCodeSearch
      )
    }))
    .sort((a, b) =>
      b.score - a.score ||
      compareNatural(
        getData(a.item).code,
        getData(b.item).code
      )
    )
    .map(entry => entry.item);
}

function highlightText(
  text,
  query
) {
  const safe =
    escapeHtml(text);

  const terms =
    String(query ?? "")
      .trim()
      .split(/\s+/)
      .filter(
        term => term.length >= 2
      );

  if (!terms.length) {
    return safe;
  }

  const patterns =
    terms
      .sort(
        (a, b) =>
          b.length - a.length
      )
      .map(term =>
        term.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )
      );

  try {
    return safe.replace(
      new RegExp(
        `(${patterns.join("|")})`,
        "gi"
      ),
      match =>
        `<mark>${match}</mark>`
    );
  }
  catch {
    return safe;
  }
}

function card(item) {
  const d =
    getData(item);

  return `
    <article class="card">

      <div class="meta">

        <span class="tag">
          ${escapeHtml(d.grade)}
        </span>

        <span class="tag">
          ${escapeHtml(d.subject)}
        </span>

        ${
          d.theme
            ? `
              <span class="tag">
                ${escapeHtml(d.theme)}
              </span>
            `
            : ""
        }

      </div>

      ${
        d.code
          ? `
            <div class="card-code">
              ${escapeHtml(d.code)}
            </div>
          `
          : ""
      }

      <h3>
        ${escapeHtml(d.title)}
      </h3>

      <div class="card-foot">

        ${
          d.file
            ? `
              <a
                class="download"
                href="${escapeHtml(d.file)}"
                download
              >
                Dosyayı İndir
              </a>
            `
            : `
              <span class="download is-error">
                Dosya yok
              </span>
            `
        }

      </div>

    </article>
  `;
}

function renderGrid(
  target,
  list
) {
  target.innerHTML =
    list.map(card).join("");
}

function resultRow(item) {
  const d =
    getData(item);

  const query =
    searchInput.value.trim();

  const compactQuery =
    normalizeCode(query);

  const codeMatch =
    compactQuery.length >= 3 &&
    /\d/.test(compactQuery) &&
    normalizeCode(d.code).includes(
      compactQuery
    );

  return `
    <tr>

      <td>
        ${escapeHtml(d.grade)}
      </td>

      <td>
        ${escapeHtml(d.subject)}
      </td>

      <td>
        ${escapeHtml(d.theme)}
      </td>

      <td>
        <span
          class="result-code${
            codeMatch
              ? " code-match"
              : ""
          }"
        >
          ${escapeHtml(d.code)}
        </span>
      </td>

      <td>

        <div class="result-title">
          ${highlightText(
            d.title,
            query
          )}
        </div>

        ${
          d.tags.length
            ? `
              <div class="result-tags">

                ${d.tags
                  .slice(0, 5)
                  .map(
                    tag => `
                      <span class="result-tag">
                        #${escapeHtml(tag)}
                      </span>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </td>

      <td>

        ${
          d.file
            ? `
              <a
                class="result-download"
                href="${escapeHtml(d.file)}"
                download
              >
                Dosyayı İndir
              </a>
            `
            : `
              <span class="result-download is-error">
                Dosya yok
              </span>
            `
        }

      </td>

    </tr>
  `;
}

function renderResults(list) {
  resultsBody.innerHTML =
    list
      .slice(0, resultsLimit)
      .map(resultRow)
      .join("");
}

async function checkFile(path) {
  if (!path) {
    return false;
  }

  if (fileStatus.has(path)) {
    return fileStatus.get(path);
  }

  let exists = false;

  try {
    const head =
      await fetch(
        path,
        {
          method: "HEAD",
          cache: "no-cache"
        }
      );

    exists = head.ok;

    if (!exists) {
      const get =
        await fetch(
          path,
          {
            method: "GET",
            headers: {
              Range: "bytes=0-0"
            },
            cache: "no-cache"
          }
        );

      exists = get.ok;
    }
  }
  catch {
    try {
      const get =
        await fetch(
          path,
          {
            method: "GET",
            headers: {
              Range: "bytes=0-0"
            },
            cache: "no-cache"
          }
        );

      exists = get.ok;
    }
    catch {
      exists = false;
    }
  }

  fileStatus.set(
    path,
    exists
  );

  return exists;
}

function render() {
  const query =
    searchInput.value.trim();

  const grade =
    gradeFilter.value;

  const subject =
    subjectFilter.value;

  const theme =
    themeFilter.value;

  const active =
    Boolean(
      query ||
      grade ||
      subject ||
      theme
    );

  const latestSource =
    [...outcomes].reverse();

  const archiveSource =
    sortArchive(outcomes);

  const latest =
    latestExpanded
      ? latestSource
      : latestSource.slice(0, 5);

  const archive =
    archiveExpanded
      ? archiveSource
      : archiveSource.slice(0, 5);

  const results =
    filtered();

  renderGrid(
    latestGrid,
    latest
  );

  renderGrid(
    allGrid,
    archive
  );

  latestCount.textContent =
    `${outcomes.length} paket`;

  allCount.textContent =
    `${outcomes.length} paket`;

  latestMore.hidden =
    outcomes.length <= 5;

  allMore.hidden =
    outcomes.length <= 5;

  latestMore.textContent =
    latestExpanded
      ? "Daha Az"
      : "Daha Fazla";

  allMore.textContent =
    archiveExpanded
      ? "Daha Az"
      : "Daha Fazla";

  if (active) {

    latestSection.hidden =
      true;

    allSection.hidden =
      true;

    resultsSection.hidden =
      false;

    resultsCount.textContent =
      `${results.length} sonuç`;

    renderResults(results);

    resultsTableWrap.hidden =
      results.length === 0;

    resultsMore.hidden =
      results.length <= resultsLimit;

    emptyState.hidden =
      results.length > 0;

    if (results.length === 0) {

      emptyState.querySelector(
        "h2"
      ).textContent =
        "Sonuç bulunamadı.";

      emptyState.querySelector(
        "p"
      ).textContent =
        "Arama metnini veya filtreleri değiştirerek tekrar deneyin.";
    }

  }
  else {

    latestSection.hidden =
      false;

    allSection.hidden =
      false;

    resultsSection.hidden =
      true;

    resultsMore.hidden =
      true;

    emptyState.hidden =
      true;
  }

  clearFilters.hidden =
    !active;
}

async function init() {

  try {

    const response =
      await fetch(
        "data/outcomes.json",
        {
          cache: "no-cache"
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const json =
      await response.json();

    outcomes =
      Array.isArray(json)
        ? json.filter(
            item =>
              item &&
              typeof item === "object"
          )
        : [];

    buildSearchIndex();
    refreshFilters();
    render();

  }
  catch (error) {

    console.error(
      "Kazanım verisi yüklenemedi:",
      error
    );

    outcomes = [];
    searchIndex = [];

    latestGrid.innerHTML = "";
    allGrid.innerHTML = "";

    latestSection.hidden =
      true;

    allSection.hidden =
      true;

    resultsSection.hidden =
      true;

    emptyState.hidden =
      false;

    emptyState.querySelector(
      "h2"
    ).textContent =
      "Kazanım listesi yüklenemedi.";

    emptyState.querySelector(
      "p"
    ).textContent =
      "data/outcomes.json dosyasını veya site bağlantısını kontrol edin.";
  }
}

searchInput.addEventListener(
  "input",
  () => {
    resultsLimit = 20;
    render();
  }
);

[
  gradeFilter,
  subjectFilter,
  themeFilter
].forEach(select => {

  select.addEventListener(
    "change",
    () => {

      resultsLimit = 20;

      refreshFilters();
      render();
    }
  );
});

clearFilters.addEventListener(
  "click",
  () => {

    gradeFilter.value = "";
    subjectFilter.value = "";
    themeFilter.value = "";

    searchInput.value = "";

    resultsLimit = 20;

    latestExpanded = false;
    archiveExpanded = false;

    refreshFilters();
    render();

    searchInput.focus();
  }
);

latestMore.addEventListener(
  "click",
  () => {

    latestExpanded =
      !latestExpanded;

    render();
  }
);

allMore.addEventListener(
  "click",
  () => {

    archiveExpanded =
      !archiveExpanded;

    render();
  }
);

resultsMore.addEventListener(
  "click",
  () => {

    resultsLimit += 20;

    render();
  }
);

document.addEventListener(
  "click",
  event => {

    const option =
      event.target.closest(
        ".filter-option"
      );

    const trigger =
      event.target.closest(
        ".filter-trigger"
      );

    if (option) {

      const root =
        option.closest(
          ".filter-select"
        );

      const key =
        root?.dataset.filter;

      const select =
        filterMap[key];

      if (select) {

        select.value =
          option.dataset.value;

        closeMenus();

        resultsLimit = 20;

        refreshFilters();
        render();
      }

      return;
    }

    if (trigger) {

      const root =
        trigger.closest(
          ".filter-select"
        );

      const menu =
        root?.querySelector(
          ".filter-menu"
        );

      if (!menu) return;

      const wasOpen =
        !menu.hidden;

      closeMenus();

      if (!wasOpen) {

        menu.hidden =
          false;

        trigger.setAttribute(
          "aria-expanded",
          "true"
        );

        menu
          .querySelector(
            '[aria-selected="true"]'
          )
          ?.focus();
      }

      return;
    }

    if (
      !event.target.closest(
        ".filter-select"
      )
    ) {
      closeMenus();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {
      closeMenus();
    }
  }
);

document.addEventListener(
  "click",
  async event => {

    const link =
      event.target.closest(
        "a[download]"
      );

    if (
      !link ||
      link.dataset.ready === "1" ||
      link.classList.contains(
        "is-error"
      )
    ) {
      return;
    }

    event.preventDefault();

    if (
      link.dataset.checking === "1"
    ) {
      return;
    }

    link.dataset.checking =
      "1";

    const original =
      link.textContent;

    link.textContent =
      "Kontrol ediliyor...";

    try {

      const exists =
        await checkFile(
          link.getAttribute(
            "href"
          )
        );

      if (!exists) {

        link.textContent =
          "Dosya bulunamadı";

        link.classList.add(
          "is-error"
        );

        return;
      }

      link.dataset.ready =
        "1";

      link.click();

    }
    catch {

      link.textContent =
        "Dosya kontrol edilemedi";

      link.classList.add(
        "is-error"
      );

    }
    finally {

      delete link.dataset.checking;

      if (
        link.dataset.ready === "1"
      ) {
        link.textContent =
          original;
      }
    }
  }
);

init();
