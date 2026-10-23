'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('data.js exposes an array of records with required fields', () => {
  const context = { window: {} };
  vm.runInNewContext(read('data.js'), context, { filename: 'data.js' });
  const records = context.window.DATA;

  assert.ok(Array.isArray(records), 'window.DATA must be an array');
  assert.ok(records.length > 0, 'keep at least one record while developing');

  const ids = new Set();
  for (const [index, item] of records.entries()) {
    assert.ok(item && typeof item === 'object' && !Array.isArray(item), `record ${index + 1} must be an object`);
    for (const field of ['id', 'g', 's', 'u', 'k', 'kt', 't']) {
      assert.equal(typeof item[field], field === 'g' ? 'number' : 'string', `record ${index + 1}: ${field} has the wrong type`);
      assert.ok(String(item[field]).trim(), `record ${index + 1}: ${field} must not be empty`);
    }
    assert.match(item.id, /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/, `record ${index + 1}: invalid id`);
    assert.ok(!ids.has(item.id), `duplicate id: ${item.id}`);
    ids.add(item.id);
    assert.ok(Number.isInteger(item.g) && item.g > 0, `record ${index + 1}: invalid grade`);
    assert.ok(Number.isFinite(item.m) && item.m >= 1, `record ${index + 1}: invalid duration`);

    if (item.dt) {
      assert.match(item.dt, /^\d{4}-\d{2}-\d{2}$/, `record ${index + 1}: invalid date format`);
      const date = new Date(item.dt + 'T00:00:00Z');
      assert.ok(!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === item.dt, `record ${index + 1}: invalid calendar date`);
    }
    if (item.f) {
      const href = String(item.f).trim();
      const localPdf = /^(?:\.\/)?pdf\/[A-Za-z0-9._/-]+\.pdf(?:[?#][^\s]*)?$/i.test(href) &&
        !href.split(/[?#]/, 1)[0].split('/').some((part) => !part || part === '.' || part === '..');
      let remotePdf = false;
      try {
        const url = new URL(href);
        remotePdf = url.protocol === 'https:' && !url.username && !url.password && /\.pdf$/i.test(url.pathname);
      } catch {}
      assert.ok(localPdf || remotePdf, `record ${index + 1}: unsafe or unsupported PDF path`);
      if (localPdf) {
        const localPath = href.split(/[?#]/, 1)[0].replace(/^\.\//, '');
        assert.ok(fs.existsSync(path.join(root, localPath)), `record ${index + 1}: local PDF file does not exist: ${localPath}`);
      }
    }
  }
});

test('PDF URL validation accepts encoded HTTPS paths and rejects unsafe URLs', () => {
  const app = read('app.js');
  const start = app.indexOf('  function safePdf(value) {');
  const end = app.indexOf('\n  function isIsoDate(value)', start);
  assert.ok(start >= 0 && end > start, 'safePdf function must remain available for focused tests');
  const source = app.slice(start, end).replace(/^  /gm, '');
  const context = { URL };
  vm.runInNewContext(source + '\nthis.safePdf = safePdf;', context);

  assert.equal(context.safePdf('https://example.com/calisma%20kagidi.pdf'),
    'https://example.com/calisma%20kagidi.pdf');
  assert.equal(context.safePdf('https://example.com/%2e%2e/private.pdf'), '');
  assert.equal(context.safePdf('javascript:alert(1)'), '');
  assert.equal(context.safePdf('https://user:pass@example.com/file.pdf'), '');
  assert.equal(context.safePdf('pdf/../private.pdf'), '');
  assert.equal(context.safePdf('pdf/calisma.pdf'), 'pdf/calisma.pdf');
});

test('print layout uses two columns and spans a single-card print across the page', () => {
  const css = read('style.css');
  const readme = read('README.md');
  assert.match(css, /#grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.print-target\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  assert.match(readme, /iki sütunlu yazdırma düzeni/i);
});

test('HTML declares Turkish language and references local application assets', () => {
  const html = read('index.html');
  assert.match(html, /<html lang="tr">/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
  assert.match(html, /<meta name="description" content="[^"]+"/i);
  for (const asset of ['style.css', 'data.js', 'app.js']) {
    assert.ok(fs.existsSync(path.join(root, asset)), `missing local asset: ${asset}`);
    assert.ok(html.includes(asset), `index.html does not reference ${asset}`);
  }
});

test('keyboard focus style is explicitly preserved for custom open buttons', () => {
  const css = read('style.css');
  assert.match(css, /\.open:focus-visible\s*\{/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('application avoids dynamic code evaluation primitives', () => {
  const app = read('app.js');
  assert.doesNotMatch(app, /\beval\s*\(/);
  assert.doesNotMatch(app, /\bnew\s+Function\s*\(/);
});

test('quiet premium design includes responsive layout, dark-theme tokens and a clear heading hierarchy', () => {
  const html = read('index.html');
  const css = read('style.css');

  assert.match(html, /class="library-heading"/);
  assert.match(html, /<h2>Çalışma kâğıtları<\/h2>/);
  assert.match(css, /\.grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /@media\s*\(max-width:\s*1080px\)/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /\.simple-filters\s*\{[^}]*background:\s*var\(--card\)/s);
});
