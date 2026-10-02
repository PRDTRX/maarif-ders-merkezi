let outcomes = [];
let availableOutcomes = [];
let searchIndex = [];
let fileStatus = new Map();
let latestExpanded = false;
let archiveExpanded = false;

const $ = selector => document.querySelector(selector);

const gradeFilter = $("#gradeFilter");
const subjectFilter = $("#subjectFilter");
const themeFilter = $("#themeFilter");
const searchInput = $("#searchInput");

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

const emptyState = $("#emptyState");

const escapeHtml = value =>
  String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));

const normalize = value =>
  String(value ?? "").trim().toLocaleLowerCase("tr-TR");

const data = item => ({
  code: item.id || "",
  grade: item.sinif || "",
  subject: item.ders || "",
  theme: item.tema || "",
  category: item.kategori || "",
  title: item.baslik || "",
  tags: Array.isArray(item.etiketler) ? item.etiketler : [],
  file: item.dosyaYolu || ""
});

const uniqueValues = (list, key, filters = {}) => [
  ...new Set(
    list
      .filter(item =>
        Object.entries(filters).every(([name, value]) =>
          !value || data(item)[name] === value
        )
      )
      .map(item => data(item)[key])
      .filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b, "tr"));

const optionHtml = (values, placeholder, selected = "") =>
  [
    `<option value="">${placeholder}</option>`,
    ...values.map(value =>
      `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`
    )
  ].join("");

const filterConfig = {
  grade: {
    select: () => gradeFilter,
    placeholder: "Tüm sınıflar"
  },
  subject: {
    select: () => subjectFilter,
    placeholder: "Tüm dersler"
  },
  theme: {
    select: () => themeFilter,
    placeholder: "Tüm temalar"
  }
};

function renderCustomFilters() {
  Object.entries(filterConfig).forEach(([key, config]) => {
    const root = document.querySelector(`.filter-select[data-filter="${key}"]`);
    const select = config.select();

    if (!root || !select) return;

    const menu = root.querySelector(".filter-menu");
    const label = root.querySelector(".filter-value");
    const value = select.value;

    label.textContent =
      select.options[select.selectedIndex]?.textContent ||
      config.placeholder;

    menu.innerHTML = [...select.options].map(option => `
      <button
        type="button"
        class="filter-option"
        role="option"
        aria-selected="${option.value === value}"
        data-value="${escapeHtml(option.value)}">
        <span>${escapeHtml(option.textContent)}</span>
      </button>
    `).join("");
  });
}

function closeMenus() {
  document.querySelectorAll(".filter-menu").forEach(menu => {
    menu.hidden = true;
    menu
      .closest(".filter-select")
      ?.querySelector(".filter-trigger")
      ?.setAttribute("aria-expanded", "false");
  });
}

function refreshFilters() {
  let grade = gradeFilter.value;
  let subject = subjectFilter.value;
  let theme = themeFilter.value;

  for (let i = 0; i < 3; i++) {
    const grades = uniqueValues(
      availableOutcomes,
      "grade",
      { subject, theme }
    );

    if (grade && !grades.includes(grade)) {
      grade = "";
    }

    const subjects = uniqueValues(
      availableOutcomes,
      "subject",
      { grade, theme }
    );

    if (subject && !subjects.includes(subject)) {
      subject = "";
    }

    const themes = uniqueValues(
      availableOutcomes,
      "theme",
      { grade, subject }
    );

    if (theme && !themes.includes(theme)) {
      theme = "";
    }
  }

  const grades = uniqueValues(
    availableOutcomes,
    "grade",
    { subject, theme }
  );

  const subjects = uniqueValues(
    availableOutcomes,
    "subject",
    { grade, theme }
  );

  const themes = uniqueValues(
    availableOutcomes,
    "theme",
    { grade, subject }
  );

  gradeFilter.innerHTML =
    optionHtml(grades, "Tüm sınıflar", grade);

  subjectFilter.innerHTML =
    optionHtml(subjects, "Tüm dersler", subject);

  themeFilter.innerHTML =
    optionHtml(themes, "Tüm temalar", theme);

  gradeFilter.value = grade;
  subjectFilter.value = subject;
  themeFilter.value = theme;

  renderCustomFilters();
}

function card(item) {
  const d = data(item);

  return `
    <article class="card">
      <div class="meta">
        <span class="tag">${escapeHtml(d.grade)}</span>
        <span class="tag">${escapeHtml(d.subject)}</span>
        ${d.theme ? `<span class="tag">${escapeHtml(d.theme)}</span>` : ""}
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

function renderGrid(target, list) {
  target.innerHTML = list.map(card).join("");
}

function buildSearchIndex() {
  searchIndex = availableOutcomes.map(item => {
    const d = data(item);

    return {
      item,
      code: normalize(d.code),
      grade: d.grade,
      subject: d.subject,
      theme: d.theme,
      category: d.category,
      title: normalize(d.title),
      tags: d.tags.map(normalize),
      searchText: normalize([
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

function filtered() {
  const q = normalize(searchInput.value);
  const grade = gradeFilter.value;
  const subject = subjectFilter.value;
  const theme = themeFilter.value;

  return searchIndex
    .filter(entry => {
      if (q && !entry.searchText.includes(q)) return false;
      if (grade && entry.grade !== grade) return false;
      if (subject && entry.subject !== subject) return false;
      if (theme && entry.theme !== theme) return false;
      return true;
    })
    .map(entry => {
      let score = 0;

      if (q) {
        if (entry.code === q) score += 1000;
        else if (entry.code.startsWith(q)) score += 900;
        else if (entry.code.includes(q)) score += 800;

        if (entry.title === q) score += 750;
        else if (entry.title.startsWith(q)) score += 700;
        else if (entry.title.includes(q)) score += 600;

        if (entry.tags.some(tag => tag === q)) score += 550;
        else if (entry.tags.some(tag => tag.startsWith(q))) score += 500;
        else if (entry.tags.some(tag => tag.includes(q))) score += 450;

        const theme = normalize(entry.theme);
        const category = normalize(entry.category);
        const subject = normalize(entry.subject);
        const grade = normalize(entry.grade);

        if (theme === q) score += 300;
        else if (theme.includes(q)) score += 250;

        if (category === q) score += 225;
        else if (category.includes(q)) score += 200;

        if (subject === q) score += 150;
        else if (subject.includes(q)) score += 125;

        if (grade === q) score += 100;
        else if (grade.includes(q)) score += 75;
      }

      return {
        item: entry.item,
        score
      };
    })
    .sort((a, b) =>
      b.score - a.score ||
      data(a.item).code.localeCompare(data(b.item).code, "tr")
    )
    .map(entry => entry.item);
}

function resultRow(item) {
  const d = data(item);

  return `
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
                ${d.tags.slice(0, 5).map(tag =>
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

function renderResults(list) {
  resultsBody.innerHTML = list.map(resultRow).join("");
}

async function checkFile(path) {
  if (!path) return false;

  if (fileStatus.has(path)) {
    return fileStatus.get(path);
  }

  let exists = false;

  try {
    const response = await fetch(path, {
      method: "HEAD",
      cache: "no-cache"
    });

    exists = response.ok;

    if (!exists && response.status !== 404) {
      const fallback = await fetch(path, {
        method: "GET",
        headers: {
          Range: "bytes=0-0"
        },
        cache: "no-cache"
      });

      exists = fallback.ok;
    }
  } catch {
    try {
      const fallback = await fetch(path, {
        method: "GET",
        headers: {
          Range: "bytes=0-0"
        },
        cache: "no-cache"
      });

      exists = fallback.ok;
    } catch {
      exists = false;
    }
  }

  fileStatus.set(path, exists);
  return exists;
}

async function filterUploadedFiles(list) {
  const results = await Promise.all(
    list.map(async item => {
      const d = data(item);
      return await checkFile(d.file) ? item : null;
    })
  );

  return results.filter(Boolean);
}

function render() {
  const active = Boolean(
    searchInput.value.trim() ||
    gradeFilter.value ||
    subjectFilter.value ||
    themeFilter.value
  );

  const latest = latestExpanded
    ? [...availableOutcomes].reverse()
    : [...availableOutcomes].slice(-5).reverse();

  const archive = archiveExpanded
    ? availableOutcomes
    : availableOutcomes.slice(0, 5);

  const results = filtered();

  renderGrid(latestGrid, latest);
  renderGrid(allGrid, archive);

  latestCount.textContent = `${availableOutcomes.length} paket`;
  allCount.textContent = `${availableOutcomes.length} paket`;

  latestMore.hidden = availableOutcomes.length <= 5;
  allMore.hidden = availableOutcomes.length <= 5;

  latestMore.textContent = latestExpanded
    ? "Daha Az"
    : "Daha Fazla";

  allMore.textContent = archiveExpanded
    ? "Daha Az"
    : "Daha Fazla";

  if (active) {
    latestSection.hidden = true;
    allSection.hidden = true;
    resultsSection.hidden = false;
    resultsCount.textContent = `${results.length} sonuç`;
    renderResults(results);
    emptyState.hidden = results.length > 0;
  } else {
    latestSection.hidden = false;
    allSection.hidden = false;
    resultsSection.hidden = true;
    emptyState.hidden = true;
  }
}

async function init() {
  try {
    const response = await fetch(
      "data/outcomes.json",
      { cache: "no-cache" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    outcomes = await response.json();

    if (!Array.isArray(outcomes)) {
      outcomes = [];
    }

    availableOutcomes = await filterUploadedFiles(outcomes);

    buildSearchIndex();
    refreshFilters();
    render();
  } catch (error) {
    outcomes = [];
    availableOutcomes = [];
    searchIndex = [];

    refreshFilters();
    render();

    emptyState.hidden = false;
    emptyState.querySelector("h2").textContent =
      "Kazanım listesi yüklenemedi.";

    emptyState.querySelector("p").textContent =
      "data/outcomes.json dosyasını kontrol edin.";

    console.error(error);
  }
}

searchInput.addEventListener("input", render);

[gradeFilter, subjectFilter, themeFilter].forEach(select => {
  select.addEventListener("change", () => {
    refreshFilters();
    render();
  });
});

document.addEventListener("click", event => {
  const trigger = event.target.closest(".filter-trigger");
  const option = event.target.closest(".filter-option");

  if (option) {
    const root = option.closest(".filter-select");
    const key = root?.dataset.filter;
    const select = filterConfig[key]?.select();

    if (select) {
      select.value = option.dataset.value;
      closeMenus();
      refreshFilters();
      render();
    }

    return;
  }

  if (trigger) {
    const root = trigger.closest(".filter-select");
    const menu = root.querySelector(".filter-menu");
    const isOpen = !menu.hidden;

    closeMenus();

    if (!isOpen) {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");

      menu
        .querySelector('[aria-selected="true"]')
        ?.focus();
    }

    return;
  }

  if (!event.target.closest(".filter-select")) {
    closeMenus();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMenus();
  }
});

latestMore.addEventListener("click", () => {
  latestExpanded = !latestExpanded;
  render();
});

allMore.addEventListener("click", () => {
  archiveExpanded = !archiveExpanded;
  render();
});

document.addEventListener("click", async event => {
  const link = event.target.closest("a[download]");

  if (
    !link ||
    link.dataset.ready === "1" ||
    link.classList.contains("is-error")
  ) {
    return;
  }

  event.preventDefault();

  if (link.dataset.checking === "1") {
    return;
  }

  link.dataset.checking = "1";

  const original = link.textContent;
  link.textContent = "Kontrol ediliyor...";

  try {
    const exists = await checkFile(link.getAttribute("href"));

    if (!exists) {
      link.textContent = "Dosya bulunamadı";
      link.classList.add("is-error");
      return;
    }

    link.dataset.ready = "1";
    link.click();
  } catch {
    link.textContent = "Dosya kontrol edilemedi";
    link.classList.add("is-error");
  } finally {
    delete link.dataset.checking;

    if (link.dataset.ready === "1") {
      link.textContent = original;
    }
  }
});

init();
