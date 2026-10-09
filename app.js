(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const form = $("#search-form");
  const input = $("#search-input");
  const grid = $("#materials-grid");
  const count = $("#result-count");
  const empty = $("#empty-state");
  const emptyTitle = $("#empty-title");
  const emptyText = $("#empty-description");
  const active = $("#active-query");
  const subject = $("#subject-filter");
  const grade = $("#grade-filter");
  const unit = $("#unit-filter");
  const state = { query: "", subject: "", grade: "", unit: "", items: [] };

  const norm = (value) => String(value ?? "")
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

  const searchText = (material) => [
    material.title, material.description, material.subject, material.grade,
    material.unit, material.topic, material.outcome, material.outcomeCode,
    topicOf(material), codeOf(material), material.keywords, material.fileName,
    material.sourceName
  ].flat().filter(Boolean).join(" ");

  const unique = (values) => [...new Set(values.filter(Boolean).map(String))]
    .sort((a, b) => a.localeCompare(b, "tr"));

  function fill(select, label, options) {
    const previous = select.value;
    select.replaceChildren(new Option(label, ""));
    options.forEach((value) => select.add(new Option(value, value)));
    if (options.includes(previous)) select.value = previous;
  }

  function updateFilters() {
    const byGrade = state.items.filter((item) => !state.grade || item.grade === state.grade);
    const bySubject = byGrade.filter((item) => !state.subject || item.subject === state.subject);
    fill(grade, "Tüm sınıflar", unique(state.items.map((item) => item.grade)));
    fill(subject, "Tüm dersler", unique(byGrade.map((item) => item.subject)));
    fill(unit, "Tüm üniteler", unique(bySubject.map((item) => item.unit)));
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
    const chars = [...raw];
    const positions = [];
    const normalized = chars.map((character, index) => {
      const value = character.toLocaleLowerCase("tr-TR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i");
      return [...value].map((part) => {
        positions.push(index);
        return /[a-z0-9]/.test(part) ? part : " ";
      }).join("");
    }).join("");

    const ranges = [];
    for (const term of terms) {
      let offset = 0;
      while (term && (offset = normalized.indexOf(term, offset)) !== -1) {
        const start = positions[offset];
        const end = positions[Math.min(positions.length - 1, offset + term.length - 1)] + 1;
        if (start !== undefined && end > start) ranges.push([start, end]);
        offset += Math.max(term.length, 1);
      }
    }

    ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const merged = [];
    for (const range of ranges) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
      else merged.push([...range]);
    }

    let cursor = 0;
    for (const [start, end] of merged) {
      if (start < cursor) continue;
      element.append(document.createTextNode(chars.slice(cursor, start).join("")));
      const mark = document.createElement("mark");
      mark.textContent = chars.slice(start, end).join("");
      element.append(mark);
      cursor = end;
    }
    element.append(document.createTextNode(chars.slice(cursor).join("")));
  }

  function card(material, terms) {
    const article = document.createElement("article");
    article.className = "material-card";

    const top = document.createElement("div");
    top.className = "card-topline";
    const badge = document.createElement("span");
    badge.className = "type-label";
    badge.textContent = material.format || "Ders materyali";
    top.append(badge);
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

    const code = codeOf(material);
    const topic = topicOf(material);
    if (code) metadata.append(chip("Kazanım kodu: " + code));
    if (topic) metadata.append(chip("Konu: " + topic));
    if (material.sourceName) metadata.append(chip("Kaynak: " + material.sourceName));
    if (material.updatedAt) metadata.append(chip("Güncelleme: " + material.updatedAt));
    article.append(metadata);

    const link = document.createElement("a");
    link.className = "card-download";
    link.href = material.url;
    link.rel = "noopener noreferrer";
    const isExternal = /^https:\/\//i.test(material.url);
    if (isExternal) {
      link.target = "_blank";
      link.setAttribute("aria-label", material.title + " bağlantısını yeni sekmede aç");
    } else {
      link.setAttribute("download", "");
      link.setAttribute("aria-label", material.title + " dosyasını indir");
    }

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", isExternal
      ? "M14 4h6v6m0-6-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"
      : "M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v3h16v-3");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    icon.append(path);
    const label = document.createElement("span");
    label.textContent = isExternal ? "Kaynağı aç" : "Materyali indir";
    link.append(icon, label);
    article.append(link);

    return article;
  }

  function render() {
    const terms = norm(state.query).split(/\s+/).filter(Boolean);
    const found = state.items.filter((item) =>
      terms.every((term) => norm(searchText(item)).includes(term))
      && (!state.subject || item.subject === state.subject)
      && (!state.grade || item.grade === state.grade)
      && (!state.unit || item.unit === state.unit)
    );

    grid.replaceChildren(...found.map((item) => card(item, terms)));
    grid.setAttribute("aria-busy", "false");
    count.textContent = found.length + (found.length === 1 ? " materyal" : " materyal");
    empty.hidden = found.length > 0;
    grid.hidden = found.length === 0;

    if (!state.items.length) {
      emptyTitle.textContent = "Henüz materyal eklenmedi";
      emptyText.textContent = "Katalogda henüz doğrulanmış bir materyal yok. Yeni içerikler eklendikçe burada listelenecek.";
    } else if (state.query || state.subject || state.grade || state.unit) {
      emptyTitle.textContent = "Eşleşen materyal bulunamadı";
      emptyText.textContent = "Arama ifadesini sadeleştir veya filtreleri temizleyerek yeniden dene.";
    } else {
      emptyTitle.textContent = "Materyaller henüz hazır değil";
      emptyText.textContent = "Yeni materyaller eklendiğinde bu alanda görünecek.";
    }

    const parts = [
      state.query ? "Arama: “" + state.query + "”" : "",
      state.grade, state.subject, state.unit
    ].filter(Boolean);
    active.hidden = parts.length === 0;
    active.textContent = parts.join(" · ");
  }

  function resetFilters() {
    state.subject = "";
    state.grade = "";
    state.unit = "";
    subject.value = "";
    grade.value = "";
    unit.value = "";
    updateFilters();
  }

  function setQuery(value) {
    state.query = value.trim();
    input.value = state.query;
    render();
  }

  function scrollToMaterials() {
    $("#materyaller").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function validMaterial(material) {
    if (!material || typeof material !== "object" || Array.isArray(material)) return false;
    if (typeof material.title !== "string" || !material.title.trim()) return false;
    if (typeof material.url !== "string" || !material.url.trim()) return false;

    const raw = material.url.trim();
    if (raw.startsWith("//") || /[\u0000-\u001f]/.test(raw)) return false;
    const absoluteHttps = /^https:\/\//i.test(raw);
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !absoluteHttps) return false;

    try {
      const url = new URL(raw, document.baseURI);
      if (url.protocol !== "https:" || url.username || url.password) return false;
      if (absoluteHttps) return true;
      const siteRoot = new URL("./", document.baseURI);
      return url.origin === location.origin && url.pathname.startsWith(siteRoot.pathname);
    } catch {
      return false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setQuery(input.value);
    scrollToMaterials();
  });
  $("#back-top").addEventListener("click", () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  }));
  input.addEventListener("input", () => {
    state.query = input.value;
    render();
  });
  grade.addEventListener("change", () => {
    state.grade = grade.value;
    state.subject = "";
    state.unit = "";
    subject.value = "";
    unit.value = "";
    updateFilters();
    render();
  });
  subject.addEventListener("change", () => {
    state.subject = subject.value;
    state.unit = "";
    unit.value = "";
    updateFilters();
    render();
  });
  unit.addEventListener("change", () => {
    state.unit = unit.value;
    updateFilters();
    render();
  });
  $("#clear-filters").addEventListener("click", () => {
    resetFilters();
    render();
  });
  $("#reset-search").addEventListener("click", () => {
    state.query = "";
    input.value = "";
    resetFilters();
    render();
    input.focus();
  });
  document.querySelectorAll("[data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      setQuery(button.dataset.query);
      scrollToMaterials();
      input.focus({ preventScroll: true });
    });
  });

  fetch("data/materials.json")
    .then((response) => {
      if (!response.ok) throw new Error("catalogue");
      return response.json();
    })
    .then((data) => {
      state.items = Array.isArray(data) ? data.filter(validMaterial) : [];
      updateFilters();
      render();
    })
    .catch(() => {
      state.items = [];
      updateFilters();
      render();
      emptyTitle.textContent = "Materyaller yüklenemedi";
      emptyText.textContent = "Katalog alınamadı. Bağlantını kontrol edip sayfayı yenilemeyi dene.";
      count.textContent = "Liste alınamadı";
    });
})();
