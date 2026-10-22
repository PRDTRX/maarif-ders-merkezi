(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const SORT_OPTIONS = ['rel', 'new', 'az'];
  const STATE_KEYS = ['q', 'grade', 'subject', 'unit', 'fav', 'a', 'sort'];

  // Önceki sürümün sıralı kimlikleri; veri kaydı sırası sonradan değişse de geçiş doğru kalsın.
  const LEGACY_IDS = new Map([
    ['1', 'mat5-dogal-sayilar-01'],
    ['2', 'mat5-kesirler-01'],
    ['3', 'turkce5-ana-fikir-01'],
    ['4', 'fen5-ay-evreleri-01'],
    ['5', 'mat6-oran-01'],
    ['6', 'fen6-isi-aliverisi-01'],
    ['7', 'sosyal6-orta-asya-01'],
    ['8', 'ing6-daily-life-01'],
    ['9', 'mat7-tam-sayilar-01'],
    ['10', 'mat7-cebirsel-ifadeler-01'],
    ['11', 'fen7-hucre-bolunmeleri-01'],
    ['12', 'turkce7-bilgilendirici-metin-01']
  ]);

  const normalize = (value) => String(value ?? '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  const numberFormat = new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    maximumFractionDigits: 1
  });

  function safePdf(value) {
    const href = String(value ?? '').trim();
    if (!href || href.startsWith('//')) return '';

    if (/^[a-z][a-z\d+.-]*:/i.test(href)) {
      try {
        const parsed = new URL(href);
        return parsed.protocol === 'https:' &&
          !parsed.username &&
          !parsed.password &&
          /\.pdf$/i.test(parsed.pathname)
          ? parsed.href
          : '';
      } catch {
        return '';
      }
    }

    const path = href.split(/[?#]/, 1)[0];
    if (!/^(?:\.\/)?pdf\/.+\.pdf$/i.test(path) || path.split('/').includes('..')) {
      return '';
    }
    return href;
  }

  function isIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function prepareData(source) {
    if (!Array.isArray(source)) {
      console.error('Etkinlik verileri yüklenemedi: window.DATA bir dizi değil.');
      return [];
    }

    const usedIds = new Set();
    const result = [];

    source.forEach((raw, index) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        console.warn('Geçersiz etkinlik kaydı atlandı. Sıra:', index + 1);
        return;
      }

      const item = {
        g: String(raw.g ?? '').trim(),
        s: String(raw.s ?? '').trim(),
        u: String(raw.u ?? '').trim(),
        k: String(raw.k ?? '').trim(),
        kt: String(raw.kt ?? '').trim(),
        t: String(raw.t ?? '').trim()
      };
      const duration = Number(raw.m);

      if (!item.g || !/^\d+$/.test(item.g) || Number(item.g) < 1 ||
          !item.s || !item.u || !item.k || !item.kt || !item.t ||
          !Number.isFinite(duration) || duration < 1) {
        console.warn('Zorunlu alanı eksik veya hatalı etkinlik kaydı atlandı. Sıra:', index + 1);
        return;
      }

      let id = String(raw.id ?? index + 1).trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id) || usedIds.has(id)) {
        console.warn('Geçersiz veya yinelenen etkinlik kimliği düzeltildi. Sıra:', index + 1);
        id = String(index + 1);
        let suffix = 0;
        while (usedIds.has(id)) {
          suffix += 1;
          id = String(index + 1) + '-' + suffix;
        }
      }
      usedIds.add(id);

      const date = String(raw.dt ?? '').trim();
      const dl = Number(raw.dl);
      const fv = Number(raw.fv);
      const normalizedItem = {
        ...item,
        id,
        ty: String(raw.ty ?? 'Etkinlik kâğıdı').trim() || 'Etkinlik kâğıdı',
        m: Math.round(duration),
        f: safePdf(raw.f),
        dt: isIsoDate(date) ? date : '',
        dl: Number.isFinite(dl) && dl > 0 ? Math.floor(dl) : 0,
        fv: Number.isFinite(fv) && fv > 0 ? Math.floor(fv) : 0
      };

      normalizedItem._h = normalize([
        normalizedItem.t,
        normalizedItem.s,
        normalizedItem.u,
        normalizedItem.k,
        normalizedItem.kt,
        normalizedItem.g + '. sınıf',
        normalizedItem.g + ' sınıf'
      ].join(' '));
      result.push(normalizedItem);
    });

    return result;
  }

  const D = prepareData(window.DATA);
  const F = { q: '', grade: '', subject: '', unit: '', fav: '', a: '', sort: 'rel' };

  function unique(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'tr'));
  }

  function fillOptions(selector, placeholder, values, current) {
    const element = $(selector);
    element.innerHTML = '<option value="">' + escapeHtml(placeholder) + '</option>' +
      values.map((value) => '<option value="' + escapeHtml(value[0]) + '">' +
        escapeHtml(value[1]) + '</option>').join('');
    element.value = values.some((value) => value[0] === current) ? current : '';
    return element.value;
  }

  function updateFilterOptions() {
    const grades = unique(D.map((item) => item.g))
      .sort((a, b) => Number(a) - Number(b));
    F.grade = fillOptions('#grade', 'Tüm sınıflar',
      grades.map((value) => [value, value + '. sınıf']), F.grade);

    const subjectEl = $('#subject');
    const unitEl = $('#unit');

    const subjects = F.grade
      ? unique(D.filter((item) => item.g === F.grade).map((item) => item.s))
      : [];
    F.subject = fillOptions('#subject', F.grade ? 'Tüm dersler' : 'Önce sınıf seç',
      subjects.map((value) => [value, value]), F.subject);

    const units = F.grade && F.subject
      ? unique(D.filter((item) => item.g === F.grade && item.s === F.subject).map((item) => item.u))
      : [];
    F.unit = fillOptions('#unit', F.grade && F.subject ? 'Tüm üniteler' : 'Önce ders seç',
      units.map((value) => [value, value]), F.unit);

    // Bağlı filtrelerin disabled durumunu yönetme
    subjectEl.disabled = !F.grade;
    unitEl.disabled = !(F.grade && F.subject);
  }

  function matches(item, searchTerms) {
    if (F.grade && item.g !== F.grade) return false;
    if (F.subject && item.s !== F.subject) return false;
    if (F.unit && item.u !== F.unit) return false;
    if (F.fav && !favs.has(item.id)) return false;
    return searchTerms.every((word) => item._h.includes(word));
  }

  function score(item, query) {
    if (!query) return 0;

    let points = 0;
    if (normalize(item.t).includes(query)) points += 5;
    if (normalize(item.k) === query) points += 8;
    if (normalize(item.u).includes(query)) points += 3;
    return points;
  }

  function metrics(item) {
    const parts = [];
    if (item.dl) {
      parts.push('<span class="metric"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v3h14v-3"/></svg>' +
        numberFormat.format(item.dl) + '</span>');
    }
    if (item.fv) {
      parts.push('<span class="metric"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.3Z"/></svg>' +
        numberFormat.format(item.fv) + '</span>');
    }
    return parts.join('');
  }

  function card(item) {
    const pdf = item.f
      ? '<a class="btn" href="' + escapeHtml(item.f) + '" target="_blank" rel="noopener noreferrer" aria-label="' +
        escapeHtml(item.t) + ' PDF aç"><span>PDF\'yi İndir / Aç</span> <span aria-hidden="true">↗</span></a>'
      : '<span class="btn unavailable" aria-disabled="true">PDF Hazırlanıyor</span>';

    return '<article class="card" data-g="' + escapeHtml(item.g) + '">' +
      '<button class="heart" data-id="' + escapeHtml(item.id) + '" aria-pressed="false" aria-label="Favorilere ekle" title="Favorilere ekle">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.3Z"/></svg>' +
      '</button>' +
      '<div class="card-header-meta">' +
        '<span>' + escapeHtml(item.g) + '. SINIF · ' + escapeHtml(item.s) + '</span>' +
        '<span class="doc-type">' + escapeHtml(item.ty) + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3><button class="open" data-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.t) + '</button></h3>' +
        '<p class="unit-text">' + escapeHtml(item.u) + '</p>' +
        '<div class="kz"><span class="kz-code">' + escapeHtml(item.k) + '</span> ' + escapeHtml(item.kt) + '</div>' +
      '</div>' +
      '<div class="card-footer">' +
        '<div class="meta"><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
        item.m + ' dk</span><span>' + metrics(item) + '</span></div>' + pdf +
      '</div>' +
    '</article>';
  }

  function syncUrl() {
    const current = new URL(location.href);
    const params = new URLSearchParams(current.search);
    STATE_KEYS.forEach((key) => params.delete(key));

    STATE_KEYS.forEach((key) => {
      if (F[key] && !(key === 'sort' && F[key] === 'rel')) {
        params.set(key, F[key]);
      }
    });

    current.search = params.toString();
    if (isStateHash(current.hash)) current.hash = '';
    history.replaceState(null, '', current.pathname + current.search + current.hash);
  }

  function render() {
    const query = normalize(F.q);
    const searchTerms = query.split(/\s+/).filter(Boolean);
    const results = D.filter((item) => matches(item, searchTerms));
    const relevance = new Map(results.map((item) => [item.id, score(item, query)]));
    const date = (item) => item.dt || '';
    results.sort((a, b) => {
      if (F.sort === 'new') {
        return date(b).localeCompare(date(a)) || Number(a.g) - Number(b.g);
      }
      if (F.sort === 'az') return a.t.localeCompare(b.t, 'tr');
      return relevance.get(b.id) - relevance.get(a.id) ||
        Number(a.g) - Number(b.g) ||
        a.s.localeCompare(b.s, 'tr') ||
        a.t.localeCompare(b.t, 'tr');
    });

    $('#grid').innerHTML = results.map(card).join('');
    $('#empty').hidden = results.length > 0;
    $('#count').textContent = results.length + ' etkinlik bulundu';

    const hasFilters = Boolean(F.q || F.grade || F.subject || F.unit || F.fav);
    $('#reset').style.visibility = hasFilters ? 'visible' : 'hidden';
    syncUrl();
    updateFavoriteUi();
  }

  function renderStats() {
    const stats = [
      [D.length, 'etkinlik'],
      [new Set(D.map((item) => item.s)).size, 'ders'],
      [new Set(D.map((item) => item.u)).size, 'ünite'],
      [new Set(D.map((item) => item.g)).size, 'sınıf düzeyi']
    ];
    $('#stats').innerHTML = stats.map((item) =>
      '<li><b>' + item[0] + '</b>' + item[1] + '</li>'
    ).join('');
  }

  function isStateHash(hash) {
    if (!hash || !hash.includes('=')) return false;
    const params = new URLSearchParams(hash.slice(1));
    return STATE_KEYS.some((key) => params.has(key));
  }

  function loadState() {
    const current = new URL(location.href);
    const queryParams = new URLSearchParams(current.search);
    const oldHashParams = isStateHash(current.hash)
      ? new URLSearchParams(current.hash.slice(1))
      : null;
    const params = oldHashParams && !STATE_KEYS.some((key) => queryParams.has(key))
      ? oldHashParams
      : queryParams;

    STATE_KEYS.forEach((key) => {
      const value = params.get(key) || '';
      F[key] = key === 'sort'
        ? (SORT_OPTIONS.includes(value) ? value : 'rel')
        : value;
    });

    if (F.a && !D.some((item) => item.id === F.a) && /^[0-9]+$/.test(F.a)) {
      F.a = LEGACY_IDS.get(F.a) || F.a;
    }
    $('#q').value = F.q;
    $('#sort').value = F.sort;
  }

  let searchJumped = false;
  $('#q').addEventListener('input', (event) => {
    F.q = event.target.value.trim();
    render();
    if (F.q && !searchJumped) {
      searchJumped = true;
      $('#bul').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
    if (!F.q) searchJumped = false;
  });

  [['grade', 'grade'], ['subject', 'subject'], ['unit', 'unit']].forEach(([id, key]) => {
    $('#' + id).addEventListener('change', (event) => {
      F[key] = event.target.value;
      if (key === 'grade') {
        F.subject = '';
        F.unit = '';
      } else if (key === 'subject') {
        F.unit = '';
      }
      updateFilterOptions();
      render();
    });
  });

  $('#sort').addEventListener('change', (event) => {
    F.sort = SORT_OPTIONS.includes(event.target.value) ? event.target.value : 'rel';
    render();
  });

  $('#reset').addEventListener('click', () => {
    Object.assign(F, { q: '', grade: '', subject: '', unit: '', fav: '' });
    $('#q').value = '';
    updateFilterOptions();
    render();
  });

  window.addEventListener('keydown', (event) => {
    const active = document.activeElement;
    if (event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        active.tagName !== 'INPUT' &&
        active.tagName !== 'SELECT' &&
        !active.isContentEditable) {
      event.preventDefault();
      $('#q').focus();
    }
  });

  const root = document.documentElement;
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  } catch {
    // Depolama kapalı
  }

  function syncThemeButton() {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const button = $('#theme');
    button.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
    button.title = dark ? 'Açık temaya geç' : 'Koyu temaya geç';
    button.innerHTML = dark
      ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.7 8.7 0 1 0 20.2 15.2Z"/></svg>';
  }

  syncThemeButton();
  $('#theme').addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', root.dataset.theme);
    } catch {
      // Depolama kapalı
    }
    syncThemeButton();
  });

  $('#yr').textContent = new Date().getFullYear();

  const ids = new Set(D.map((item) => item.id));
  let favs = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem('favs') || '[]');
    if (Array.isArray(stored)) {
      const migrated = stored.map(String).map((id) => {
        if (ids.has(id)) return id;
        if (/^[0-9]+$/.test(id)) return LEGACY_IDS.get(id) || '';
        return '';
      }).filter((id) => ids.has(id));
      favs = new Set(migrated);
      if (migrated.length !== stored.length || stored.some((id) => !ids.has(String(id)))) {
        try {
          localStorage.setItem('favs', JSON.stringify([...favs]));
        } catch {
          // Saklama alanı yazmaya kapalı
        }
      }
    }
  } catch {
    favs = new Set();
  }

  const dialog = $('#dlg');
  const formatDate = (value) => value
    ? new Date(value + 'T12:00:00').toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    : '—';

  function updateFavoriteUi() {
    $('#favn').textContent = favs.size;
    $('#favt').classList.toggle('on', Boolean(F.fav));
    $('#favt').setAttribute('aria-pressed', String(Boolean(F.fav)));

    document.querySelectorAll('.heart').forEach((button) => {
      const active = favs.has(button.dataset.id);
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? 'Favorilerden çıkar' : 'Favorilere ekle');
      button.title = active ? 'Favorilerden çıkar' : 'Favorilere ekle';
    });
  }

  function toggleFavorite(id) {
    if (!ids.has(id)) return;
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);

    try {
      localStorage.setItem('favs', JSON.stringify([...favs]));
    } catch {
      // Depolama kapalı
    }

    if (F.fav) render();
    else updateFavoriteUi();
  }

  function openDialog(id) {
    const item = D.find((record) => record.id === id);
    if (!item) {
      F.a = '';
      syncUrl();
      if (dialog.open) dialog.close();
      return;
    }

    F.a = item.id;
    syncUrl();
    dialog.dataset.g = item.g;

    const similar = D
      .filter((other) => other.id !== item.id &&
        (other.k === item.k || (other.u === item.u && other.g === item.g)))
      .sort((a, b) => Number(b.k === item.k) - Number(a.k === item.k))
      .slice(0, 3);

    const pdf = item.f
      ? '<a class="btn" href="' + escapeHtml(item.f) + '" target="_blank" rel="noopener noreferrer">PDF aç</a>'
      : '<span class="btn unavailable" aria-disabled="true">PDF henüz eklenmedi</span>';

    const dl = item.dl
      ? '<div><dt>İndirme</dt><dd>' + numberFormat.format(item.dl) + '</dd></div>'
      : '';
    const fv = item.fv
      ? '<div><dt>Favori</dt><dd>' + numberFormat.format(item.fv) + '</dd></div>'
      : '';
    const related = similar.length
      ? '<h4>Benzer etkinlikler</h4><div class="sim">' + similar.map((other) =>
        '<button class="pill" data-open="' + escapeHtml(other.id) + '">' +
        escapeHtml(other.t) + '</button>'
      ).join('') + '</div>'
      : '';

    $('#dc').innerHTML =
      '<button class="x" data-close aria-label="Kapat">✕</button>' +
      '<span class="chip">' + escapeHtml(item.g) + '. sınıf · ' + escapeHtml(item.s) + '</span>' +
      '<h2 id="dialog-title">' + escapeHtml(item.t) + '</h2>' +
      '<p class="unit">' + escapeHtml(item.u) + '</p>' +
      '<p class="kz"><b>' + escapeHtml(item.k) + '</b> ' + escapeHtml(item.kt) + '</p>' +
      '<dl><div><dt>Süre</dt><dd>' + item.m + ' dk</dd></div>' +
      '<div><dt>Eklenme</dt><dd>' + formatDate(item.dt) + '</dd></div>' + dl + fv + '</dl>' +
      '<div class="acts">' + pdf +
      '<button class="pill heart dialog-heart" data-id="' + escapeHtml(item.id) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.8 2.3Z"/></svg>' +
      '<span>Favori</span></button></div>' + related;

    updateFavoriteUi();
    if (!dialog.open) dialog.showModal();
  }

  $('#grid').addEventListener('click', (event) => {
    const favorite = event.target.closest('.heart');
    const open = event.target.closest('.open');
    if (favorite) toggleFavorite(favorite.dataset.id);
    else if (open) openDialog(open.dataset.id);
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target;
    const favorite = target.closest('.heart');
    const open = target.closest('[data-open]');
    if (target === dialog || target.closest('[data-close]')) dialog.close();
    else if (favorite) toggleFavorite(favorite.dataset.id);
    else if (open) openDialog(open.dataset.open);
  });

  dialog.addEventListener('close', () => {
    F.a = '';
    syncUrl();
  });

  $('#favt').addEventListener('click', () => {
    F.fav = F.fav ? '' : '1';
    render();
  });
  $('#prt').addEventListener('click', () => window.print());

  window.addEventListener('popstate', () => {
    loadState();
    updateFilterOptions();
    render();
    if (F.a) openDialog(F.a);
    else if (dialog.open) dialog.close();
  });

  loadState();
  updateFilterOptions();
  renderStats();
  render();
  if (F.a) openDialog(F.a);
})();