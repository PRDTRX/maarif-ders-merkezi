(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const form = $("#search-form");
  const input = $("#search-input");
  const grid = $("#materials-grid");
  const count = $("#result-count");
  const empty = $("#empty-state");
  const emptyEyebrow = $("#empty-eyebrow");
  const emptyTitle = $("#empty-title");
  const emptyText = $("#empty-description");
  const active = $("#active-query");
  const status = $("#catalog-status");
  const statusText = $("#catalog-status-text");
  const subject = $("#subject-filter");
  const grade = $("#grade-filter");
  const unit = $("#unit-filter");
  const format = $("#format-filter");
  const sort = $("#sort-filter");
  const themeToggle = $("#theme-toggle");

  const state = {
    query: "",
    subject: "",
    grade: "",
    unit: "",
    format: "",
    sort: "relevance",
    items: [],
    loadError: false,
    invalidCount: 0
  };

  const normalize = (value) => String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const codeOf = (material) => String(material.outcomeCode || "").trim()
    || (String(material.outcome || "").match(/^([A-ZÇĞİÖŞÜ]+(?:\.[A-ZÇĞİÖŞÜ0-9]+)+\.?)/) || [])[1]
    || "";

  const topicOf = (material) => String(material.outcomeTopic || material.topic || material.outcome || "")
    .replace(codeOf(material), "")
    .replace(/^[\s:–—.-]+/, "")
    .trim();

  const searchableText = (material) => [
    material.title,
    material.description,
    material.subject,
    material.grade,
    material.unit,
    material.topic,
    material.outcome,
    material.outcomeCode,
    topicOf(material),
    codeOf(material),
    material.keywords,
    material.fileName,
    material.sourceName,
    material.academicYear,
    material.curriculumVersion,
    material.verificationStatus,
    material.license
  ].flat().filter(Boolean).join(" ");

  const unique = (values) => [...new Set(values.filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b, "tr", { sensitivity: "base" }));

  function fillSelect(select, placeholder, values, selected) {
    select.replaceChildren(new Option(placeholder, ""));
    values.forEach((value) => select.add(new Option(value, value)));
    select.value = values.includes(selected) ? selected : "";
  }

  function currentOptions() {
    const byGrade = state.items.filter((item) => !state.grade || item.grade === state.grade);
    const bySubject = byGrade.filter((item) => !state.subject || item.subject === state.subject);
    const byUnit = bySubject.filter((item) => !state.unit || item.unit === state.unit);

    return {
      grades: unique(state.items.map((item) => item.grade)),
      subjects: unique(byGrade.map((item) => item.subject)),
      units: unique(bySubject.map((item) => item.unit)),
      formats: unique(byUnit.map((item) => item.format || "Ders materyali"))
    };
  }

  function reconcileFilters() {
    const allGrades = unique(state.items.map((item) => item.grade));
    if (!allGrades.includes(state.grade)) state.grade = "";

    let items = state.items.filter((item) => !state.grade || item.grade === state.grade);
    const subjects = unique(items.map((item) => item.subject));
    if (!subjects.includes(state.subject)) state.subject = "";

    items = items.filter((item) => !state.subject || item.subject === state.subject);
    const units = unique(items.map((item) => item.unit));
    if (!units.includes(state.unit)) state.unit = "";

    items = items.filter((item) => !state.unit || item.unit === state.unit);
    const formats = unique(items.map((item) => item.format || "Ders materyali"));
    if (!formats.includes(state.format)) state.format = "";
  }

  function updateFilters() {
    const options = currentOptions();
    fillSelect(grade, "Tüm sınıflar", options.grades, state.grade);
    fillSelect(subject, "Tüm dersler", options.subjects, state.subject);
    fillSelect(unit, "Tüm üniteler", options.units, state.unit);
    fillSelect(format, "Tüm türler", options.formats, state.format);
    grade.disabled = options.grades.length === 0;
    subject.disabled = options.subjects.length === 0;
    unit.disabled = options.units.length === 0;
    format.disabled = options.formats.length === 0;
  }

  function chip(text) {
    const element = document.createElement("span");
    element.className = "meta-chip";
    element.textContent = text;
    return element;
  }

  function appendHighlighted(element, text, terms) {
    const raw = String(text ?? "");
    if (!raw) return;
    if (!terms.length) {
      element.append(document.createTextNode(raw));
      return;
    }

    const characters = [...raw];
    const sourcePositions = [];
    const normalized = characters.map((character, index) => {
      const folded = character.toLocaleLowerCase("tr-TR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i");
      return [...folded].map((part) => {
        sourcePositions.push(index);
        return /[a-z0-9]/.test(part) ? part : " ";
      }).join("");
    }).join("");

    const ranges = [];
    for (const term of terms) {
      let offset = 0;
      while (term && (offset = normalized.indexOf(term, offset)) !== -1) {
        const start = sourcePositions[offset];
        const endPosition = sourcePositions[Math.min(sourcePositions.length - 1, offset + term.length - 1)];
        if (start !== undefined && endPosition !== undefined && endPosition + 1 > start) {
          ranges.push([start, endPosition + 1]);
        }
        offset += Math.max(term.length, 1);
      }
    }

    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([...range]);
    }

    let cursor = 0;
    for (const [start, end] of merged) {
      if (start < cursor) continue;
      element.append(document.createTextNode(characters.slice(cursor, start).join("")));
      const mark = document.createElement("mark");
      mark.textContent = characters.slice(start, end).join("");
      element.append(mark);
      cursor = end;
    }
    element.append(document.createTextNode(characters.slice(cursor).join("")));
  }

  function icon(pathData) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  function safeHttpsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    const raw = value.trim();
    if (!/^https:\/\//i.test(raw) || raw.startsWith("//") || /[\u0000-\u001f]/.test(raw)) return null;

    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  function validMaterial(material) {
    if (!material || typeof material !== "object" || Array.isArray(material)) return false;
    if (typeof material.title !== "string" || !material.title.trim() || material.title.trim().length > 180) return false;
    if (typeof material.url !== "string" || !material.url.trim()) return false;

    const raw = material.url.trim();
    if (raw.startsWith("//") || /[\u0000-\u001f]/.test(raw)) return false;
    const externalUrl = safeHttpsUrl(raw);

    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !externalUrl) return false;

    try {
      const resolved = new URL(raw, document.baseURI);
      if (resolved.protocol !== "https:" || resolved.username || resolved.password) return false;
      if (externalUrl) return true;

      const siteRoot = new URL("./", document.baseURI);
      if (resolved.origin !== location.origin || !resolved.pathname.startsWith(siteRoot.pathname)) return false;
      if (resolved.pathname === siteRoot.pathname || resolved.pathname.endsWith("/")) return false;
      return true;
    } catch {
      return false;
    }
  }

  function addSourceLink(container, material) {
    const sourceUrl = safeHttpsUrl(material.sourceUrl);
    if (!sourceUrl) return;

    const link = document.createElement("a");
    link.className = "card-source-link";
    link.href = sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(document.createTextNode("Kaynak sayfası "));
    link.append(icon("M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"));
    link.setAttribute("aria-label", String(material.sourceName || "Materyal") + " kaynak sayfasını yeni sekmede aç");
    container.append(link);
  }

  function card(material, terms) {
    const article = document.createElement("article");
    article.className = "material-card";

    const top = document.createElement("div");
    top.className = "card-topline";

    const label = document.createElement("span");
    label.className = "type-label";
    label.textContent = material.format || "Ders materyali";
    top.append(label);

    if (material.fileSize) {
      const size = document.createElement("span");
      size.className = "file-size";
      size.textContent = material.fileSize;
      top.append(size);
    }
    article.append(top);

    const heading = document.createElement("h3");
    appendHighlighted(heading, material.title, terms);
    article.append(heading);

    if (material.description) {
      const description = document.createElement("p");
      description.className = "card-description";
      appendHighlighted(description, material.description, terms);
      article.append(description);
    }

    const metadata = document.createElement("div");
    metadata.className = "card-meta";
    [material.grade, material.subject, material.unit].filter(Boolean).forEach((value) => {
      const item = chip(value);
      appendHighlighted(item, value, terms);
      metadata.append(item);
    });

    const outcomeCode = codeOf(material);
    const outcomeTopic = topicOf(material);
    if (outcomeCode) metadata.append(chip("Öğrenme çıktısı: " + outcomeCode));
    if (outcomeTopic) metadata.append(chip("Konu: " + outcomeTopic));
    if (material.academicYear) metadata.append(chip("Eğitim yılı: " + material.academicYear));
    if (material.curriculumVersion) metadata.append(chip("Program: " + material.curriculumVersion));
    if (material.verifiedAt) metadata.append(chip("Kontrol: " + material.verifiedAt));
    if (material.verificationStatus) metadata.append(chip("Durum: " + material.verificationStatus));
    if (material.license) metadata.append(chip("Kullanım: " + material.license));
    article.append(metadata);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const materialUrl = safeHttpsUrl(material.url);
    const link = document.createElement("a");
    link.className = "card-download";
    link.href = material.url.trim();
    link.rel = "noopener noreferrer";

    if (materialUrl) {
      link.target = "_blank";
      link.setAttribute("aria-label", material.title + " bağlantısını yeni sekmede aç");
      link.append(icon("M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"));
      link.append(document.createTextNode("Kaynağı aç"));
    } else {
      link.setAttribute("download", material.fileName || "");
      link.setAttribute("aria-label", material.title + " dosyasını indir");
      link.append(icon("M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v3h16v-3"));
      link.append(document.createTextNode("Materyali indir"));
    }

    actions.append(link);
    addSourceLink(actions, material);
    article.append(actions);
    return article;
  }

  function sortItems(items) {
    const sorted = [...items];
    if (state.sort === "title-asc") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "tr", { sensitivity: "base" }));
    } else if (state.sort === "updated-desc") {
      sorted.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")) ||
        a.title.localeCompare(b.title, "tr", { sensitivity: "base" }));
    }
    return sorted;
  }

  function setEmptyState(kind) {
    emptyEyebrow.textContent = kind === "error" ? "BAĞLANTI DURUMU" : kind === "results" ? "ARAMA SONUCU" : "KÜTÜPHANE DURUMU";

    if (kind === "error") {
      emptyTitle.textContent = "Katalog yüklenemedi";
      emptyText.textContent = "Materyal listesi alınırken bir sorun oluştu. Bağlantını kontrol edip yeniden deneyebilirsin.";
      return;
    }

    if (kind === "results") {
      emptyTitle.textContent = "Aramana uygun materyal bulunamadı";
      emptyText.textContent = "Arama kelimelerini sadeleştir veya filtreleri temizleyerek yeniden dene.";
      return;
    }

    emptyTitle.textContent = "Katalog hazırlanıyor";
    emptyText.textContent = "Doğrulanmış materyaller eklendikçe bu alanda listelenecek. Bu sırada resmî öğretim programlarını inceleyebilirsin.";
  }

  function writeUrlState() {
    try {
      const url = new URL(window.location.href);
      const params = [
        ["q", state.query],
        ["sinif", state.grade],
        ["ders", state.subject],
        ["unite", state.unit],
        ["tur", state.format],
        ["sirala", state.sort === "relevance" ? "" : state.sort]
      ];

      params.forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      });

      window.history.replaceState(null, "", url);
    } catch {
      // URL state is an enhancement; filtering remains available without it.
    }
  }

  function render() {
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    const filtered = state.items.filter((item) =>
      terms.every((term) => item.searchIndex.includes(term)) &&
      (!state.subject || item.subject === state.subject) &&
      (!state.grade || item.grade === state.grade) &&
      (!state.unit || item.unit === state.unit) &&
      (!state.format || (item.format || "Ders materyali") === state.format)
    );
    const found = sortItems(filtered);

    grid.replaceChildren(...found.map((item) => card(item, terms)));
    grid.setAttribute("aria-busy", "false");
    grid.hidden = found.length === 0;
    empty.hidden = found.length > 0;

    if (state.loadError) {
      setEmptyState("error");
      status.dataset.state = "error";
      statusText.textContent = "Bağlantı sorunu";
      count.textContent = "Materyal listesi alınamadı";
    } else if (state.items.length === 0) {
      setEmptyState("catalogue");
      status.dataset.state = "empty";
      statusText.textContent = "Katalog hazırlanıyor";
      count.textContent = "Henüz materyal yok";
    } else {
      setEmptyState("results");
      status.dataset.state = "ready";
      statusText.textContent = state.items.length + " materyal katalogda";
      count.textContent = found.length + " materyal bulundu" +
        (state.invalidCount ? " · " + state.invalidCount + " geçersiz kayıt atlandı" : "");
    }

    const parts = [
      state.query ? "Arama: “" + state.query + "”" : "",
      state.grade,
      state.subject,
      state.unit,
      state.format
    ].filter(Boolean);
    active.hidden = parts.length === 0;
    active.textContent = parts.join(" · ");

    const retry = $("#retry-load");
    if (state.loadError && !retry) {
      const retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.id = "retry-load";
      retryButton.className = "button button--secondary";
      retryButton.textContent = "Yeniden dene";
      retryButton.addEventListener("click", loadCatalog);
      $(".empty-actions", empty).prepend(retryButton);
    } else if (!state.loadError && retry) {
      retry.remove();
    }

    writeUrlState();
  }

  function resetFilters() {
    state.subject = "";
    state.grade = "";
    state.unit = "";
    state.format = "";
    updateFilters();
  }

  function resetAll() {
    state.query = "";
    state.sort = "relevance";
    input.value = "";
    sort.value = "relevance";
    resetFilters();
    render();
    input.focus();
  }

  function loadQueryState() {
    const params = new URL(window.location.href).searchParams;
    state.query = params.get("q") || "";
    state.grade = params.get("sinif") || "";
    state.subject = params.get("ders") || "";
    state.unit = params.get("unite") || "";
    state.format = params.get("tur") || "";
    const requestedSort = params.get("sirala") || "relevance";
    state.sort = ["relevance", "title-asc", "updated-desc"].includes(requestedSort) ? requestedSort : "relevance";
    input.value = state.query;
    sort.value = state.sort;
  }

  async function loadCatalog() {
    grid.setAttribute("aria-busy", "true");
    status.dataset.state = "loading";
    statusText.textContent = "Katalog yükleniyor";
    count.textContent = "Materyaller yükleniyor…";
    state.loadError = false;

    try {
      const response = await fetch("data/materials.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Catalogue request failed: " + response.status);

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Catalogue must be a JSON array");

      const valid = data.filter(validMaterial);
      state.invalidCount = data.length - valid.length;
      state.items = valid.map((item) => ({
        ...item,
        searchIndex: normalize(searchableText(item))
      }));

      reconcileFilters();
      updateFilters();
      state.loadError = false;
    } catch (error) {
      state.items = [];
      state.invalidCount = 0;
      state.loadError = true;
      console.error("Maarif Ders Merkezi: katalog yüklenemedi.", error);
    }

    grid.setAttribute("aria-busy", "false");
    render();
  }

  function initializeTheme() {
    let savedTheme = "";
    try {
      savedTheme = window.localStorage.getItem("maarif-theme") || "";
    } catch {
      savedTheme = "";
    }

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : (systemPrefersDark ? "dark" : "light");

    document.documentElement.dataset.theme = theme;
    updateThemeButton(theme);
  }

  function updateThemeButton(theme) {
    const dark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", dark ? "Açık temaya geç" : "Koyu temaya geç");
    themeToggle.setAttribute("title", dark ? "Açık temaya geç" : "Koyu temaya geç");
    const themeColor = $("meta[name='theme-color']");
    if (themeColor) themeColor.setAttribute("content", dark ? "#101712" : "#f6f7f2");
  }

  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    updateThemeButton(nextTheme);
    try {
      window.localStorage.setItem("maarif-theme", nextTheme);
    } catch {
      // Theme changes still work for the current page if storage is unavailable.
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = input.value.trim();
    input.value = state.query;
    render();
    $("#materyaller").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  });

  input.addEventListener("input", () => {
    state.query = input.value;
    render();
  });

  grade.addEventListener("change", () => {
    state.grade = grade.value;
    state.subject = "";
    state.unit = "";
    state.format = "";
    updateFilters();
    render();
  });

  subject.addEventListener("change", () => {
    state.subject = subject.value;
    state.unit = "";
    state.format = "";
    updateFilters();
    render();
  });

  unit.addEventListener("change", () => {
    state.unit = unit.value;
    state.format = "";
    updateFilters();
    render();
  });

  format.addEventListener("change", () => {
    state.format = format.value;
    render();
  });

  sort.addEventListener("change", () => {
    state.sort = sort.value;
    render();
  });

  $("#clear-filters").addEventListener("click", () => {
    resetFilters();
    render();
  });

  $("#reset-search").addEventListener("click", resetAll);
  themeToggle.addEventListener("click", toggleTheme);

  loadQueryState();
  initializeTheme();
  loadCatalog();
})();
