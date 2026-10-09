import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");
const html = read("index.html");
const app = read("app.js");
const css = read("styles.css");
const materials = JSON.parse(read("data/materials.json"));
const workflow = read(".github/workflows/site-quality.yml");

assert.match(html, /^<!doctype html>/i, "HTML5 doctype is required");
assert.match(html, /<html\b[^>]*\blang=["']tr["']/i, "Document language must be Turkish");
assert.match(html, /<meta\s+charset=["']utf-8["']/i, "UTF-8 charset is required");
assert.match(html, /<meta\s+name=["']viewport["']/i, "Responsive viewport is required");
assert.match(html, /<title>[^<]+<\/title>/i, "A non-empty page title is required");
assert.match(html, /<meta\s+name=["']description["'][^>]*content=["'][^"']{40,}["']/i, "A useful meta description is required");
assert.match(html, /<link\s+rel=["']canonical["'][^>]*href=["']https:\/\//i, "HTTPS canonical URL is required");
assert.match(html, /<meta\s+property=["']og:title["']/i, "Open Graph title is required");
assert.match(html, /<meta\s+property=["']og:description["']/i, "Open Graph description is required");
assert.match(html, /<meta\s+name=["']twitter:card["']/i, "Twitter card type is required");
assert.match(html, /id=["']main["']/i, "Main content target is required for skip link");
assert.match(html, /class=["']skip-link["'][^>]*href=["']#main["']/i, "Keyboard skip link must target main");
assert.match(html, /<main\b/i, "A main landmark is required");
assert.match(html, /<h1\b/i, "A primary heading is required");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "Use exactly one h1");
assert.match(html, /id=["']result-count["'][^>]*aria-live=["']polite["']/i, "Search result count must be announced");
assert.match(html, /id=["']materials-grid["'][^>]*aria-busy=["']true["']/i, "Material list must expose its loading state");
assert.match(html, /id=["']search-input["'][^>]*type=["']search["']/i, "Search field must use search input type");
assert.match(html, /id=["']grade-filter["']/i, "Grade filter is required");
assert.match(html, /id=["']subject-filter["']/i, "Subject filter is required");
assert.match(html, /id=["']unit-filter["']/i, "Unit filter is required");
assert.match(html, /target=["']_blank["'][^>]*rel=["']noopener noreferrer["']/i, "External links opened in new tabs must be isolated");
assert.match(css, /:focus-visible/, "Visible keyboard focus styles are required");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion support is required");
assert.match(css, /@media\s*\(max-width:\s*520px\)/, "Small-screen responsive styles are required");
assert.match(css, /min-width:\s*0/, "Grid/flex children should be allowed to shrink");
assert.match(app, /function validMaterial\(material\)/, "Material URL validation is required");
assert.match(app, /data\.filter\(validMaterial\)/, "Material data must pass runtime validation");
assert.match(app, /createTextNode/, "Dynamic content must be inserted as text nodes");
assert.doesNotMatch(app, /\.innerHTML\s*=/, "Do not inject untrusted content with innerHTML");
assert.doesNotMatch(app, /javascript:/i, "Do not use javascript: URLs");
assert.ok(Array.isArray(materials), "Materials catalogue must be a JSON array");
assert.ok(!/permissions:\s*write-all/i.test(workflow), "CI must not request write-all permissions");
assert.ok(existsSync("robots.txt") && existsSync("sitemap.xml"), "robots.txt and sitemap.xml must exist");

const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
const sitemap = read("sitemap.xml");
assert.ok(canonical && sitemap.includes(canonical), "Sitemap must include the canonical page URL");

const baseUrl = new URL(canonical);
const seenUrls = new Set();
const seenTitles = new Set();

for (const [index, item] of materials.entries()) {
  const label = `Material ${index + 1}`;
  assert.ok(item && typeof item === "object" && !Array.isArray(item), `${label} must be an object`);
  assert.ok(typeof item.title === "string" && item.title.trim(), `${label} needs a title`);
  assert.ok(typeof item.url === "string" && item.url.trim(), `${label} needs a URL`);
  assert.ok(item.title.length <= 180, `${label} title is too long`);
  assert.ok(!/[\u0000-\u001f]/.test(item.url), `${label} URL contains control characters`);

  const raw = item.url.trim();
  assert.ok(!raw.startsWith("//"), `${label} must not use a protocol-relative URL`);
  assert.ok(!/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^https:\/\//i.test(raw), `${label} absolute URL must use HTTPS`);

  let resolved;
  try {
    resolved = new URL(raw, baseUrl);
  } catch {
    assert.fail(`${label} URL is invalid`);
  }
  assert.equal(resolved.protocol, "https:", `${label} must resolve to HTTPS`);
  assert.ok(!resolved.username && !resolved.password, `${label} URL must not contain credentials`);
  assert.ok(/^https:\/\//i.test(raw) || (resolved.origin === baseUrl.origin && resolved.pathname.startsWith("/maarif-ders-merkezi/")), `${label} relative URL must stay within the published site path`);

  const normalizedUrl = resolved.href;
  assert.ok(!seenUrls.has(normalizedUrl), `${label} duplicates a previous URL`);
  seenUrls.add(normalizedUrl);
  const normalizedTitle = item.title.trim().toLocaleLowerCase("tr-TR");
  assert.ok(!seenTitles.has(normalizedTitle), `${label} duplicates a previous title`);
  seenTitles.add(normalizedTitle);

  for (const field of ["description", "subject", "grade", "unit", "topic", "outcome", "outcomeCode", "outcomeTopic", "sourceName", "sourceUrl", "updatedAt", "format", "fileName", "fileSize"]) {
    if (item[field] !== undefined) assert.equal(typeof item[field], "string", `${label} field ${field} must be a string`);
  }
  if (item.keywords !== undefined) {
    assert.ok(Array.isArray(item.keywords) && item.keywords.every((word) => typeof word === "string"), `${label} keywords must be an array of strings`);
  }
  if (item.sourceUrl) {
    const sourceUrl = new URL(item.sourceUrl);
    assert.equal(sourceUrl.protocol, "https:", `${label} source URL must use HTTPS`);
  }
  if (item.updatedAt) {
    assert.match(item.updatedAt, /^\d{4}-\d{2}-\d{2}$/, `${label} updatedAt must use YYYY-MM-DD`);
    assert.ok(!Number.isNaN(Date.parse(item.updatedAt)), `${label} updatedAt must be a valid date`);
  }
}

console.log(`Site validation passed: ${materials.length} material record(s), required metadata, accessibility hooks, URL safety, and CI permissions checked.`);
if (materials.length === 0) {
  console.warn("NOTICE: catalogue is empty; no content records were invented. Add reviewed, real materials before announcing the catalogue as populated.");
}
