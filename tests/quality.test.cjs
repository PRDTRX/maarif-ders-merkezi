const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function loadData() {
  const context = { window: {} };
  vm.runInNewContext(read('data.js'), context, { filename: 'data.js' });
  return context.window.DATA;
}

test('HTML references existing local stylesheets and scripts', () => {
  const html = read('index.html');
  const localAssets = [
    ...[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]),
    ...[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1])
  ].filter((url) => !/^(?:[a-z]+:|\/\/|#|data:)/i.test(url));

  for (const asset of localAssets) {
    assert.ok(fs.existsSync(path.join(root, asset.split(/[?#]/, 1)[0])), `Missing local asset: ${asset}`);
  }
});

test('catalogue records have valid required fields and unique stable IDs', () => {
  const data = loadData();
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);

  const ids = new Set();
  for (const [index, item] of data.entries()) {
    assert.ok(item && typeof item === 'object' && !Array.isArray(item), `Invalid record at index ${index}`);
    assert.match(String(item.id ?? ''), /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/, `Invalid ID at index ${index}`);
    assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
    ids.add(item.id);

    assert.match(String(item.g ?? ''), /^[1-9]\d*$/, `Invalid grade for ${item.id}`);
    for (const field of ['s', 'u', 'k', 'kt', 't']) {
      assert.equal(typeof item[field], 'string', `${item.id}: ${field} must be a string`);
      assert.ok(item[field].trim(), `${item.id}: ${field} must not be empty`);
    }
    assert.ok(Number.isFinite(Number(item.m)) && Number(item.m) >= 1, `${item.id}: invalid duration`);

    if (item.dt) {
      assert.match(item.dt, /^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(`${item.dt}T00:00:00Z`);
      assert.ok(!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === item.dt,
        `${item.id}: invalid calendar date`);
    }
    if (item.f) {
      assert.match(item.f, /^(?:\.\/)?pdf\/[A-Za-z0-9._/-]+\.pdf$/i, `${item.id}: unsafe or unsupported local PDF path`);
      assert.ok(!item.f.split('/').some((part) => part === '.' || part === '..' || part === ''),
        `${item.id}: path traversal or empty path segment`);
    }
  }
});

test('HTML includes accessible page landmarks and a named resource dialog', () => {
  const html = read('index.html');
  assert.match(html, /<html\s+lang=["']tr["']/i);
  assert.match(html, /<main\b[^>]*\bid=["']bul["']/i);
  assert.match(html, /class=["']skip-link["']/i);
  assert.match(html, /<dialog\b[^>]*aria-labelledby=["']dialog-title["']/i);
});

test('CSS defines responsive layouts and dedicated print rules', () => {
  const css = read('style.css');
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)/);
  assert.match(css, /@media\s+print\s*\{/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});
