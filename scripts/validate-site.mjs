import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const html = read("index.html");
const app = read("app.js");
const css = read("styles.css");
const materials = JSON.parse(read("data/materials.json"));
const schema = JSON.parse(read("data/materials.schema.json"));
const workflow = read(".github/workflows/site-quality.yml");
const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];

assert.match(html, /^<!doctype html>/i, "HTML5 doctype is required");
assert.match(html, /<html\b[^>]*\blang=["']tr["']/i, "Document language must be Turkish");
assert.match(html, /<meta\s+charset=["']utf-8["']/i, "UTF-8 charset is required");
assert.match(html, /<meta\s+name=["']viewport["']/i, "Responsive viewport is required");
assert.match(html, /<title>[^<]+<\/title>/i, "A non-empty page title is required");
assert.match(html, /<meta\s+name=["']description["'][^>]*content=["'][^"']{40,}["']/i, "A useful meta description is required");
assert.ok(canonical && /^https:\/\//i.test(canonical), "HTTPS canonical URL is required");
assert.match(html, /<meta\s+property=["']og:title["']/i, "Open Graph title is required");
assert.match(html, /<meta\s+property=["']og:description["']/i, "Open Graph description is required");
assert.match(html, /<meta\s+property=["']og:image["']/i, "Open Graph image metadata is required");
assert.match(html, /<meta\s+name=["']twitter:card["']/i, "Twitter card type is required");
assert.match(html, /<meta\s+name=["']twitter:image["']/i, "Twitter image metadata is required");
assert.match(html, /<main\b/i, "A main landmark is required");
assert.match(html, /<h1\b/i, "A primary heading is required");
assert.equal((html.match(/<h1\b/gi) || []).length, 1, "Use exactly one h1");
assert.match(html, /class=["']skip-link["'][^>]*href=["']#main["']/i, "Keyboard skip link must target main");
assert.match(html, /id=["']result-count["'][^>]*aria-live=["']polite["']/i, "Search result count must be announced");
assert.match(html, /id=["']materials-grid["'][^>]*aria-busy=["']true["']/i, "Material list must expose its loading state");
assert.match(html, /id=["']search-input["'][^>]*type=["']search["']/i, "Search field must use search input type");
assert.match(html, /id=["']grade-filter["']/i, "Grade filter is required");
assert.match(html, /id=["']subject-filter["']/i, "Subject filter is required");
assert.match(html, /id=["']unit-filter["']/i, "Unit filter is required");
assert.match(html, /id=["']format-filter["']/i, "Format filter is required");
assert.match(html, /id=["']sort-filter["']/i, "Sort control is required");
assert.match(html, /id=["']theme-toggle["']/i, "Theme toggle is required");
assert.match(html, /class=["']noscript-notice["']/, "A no-JavaScript fallback notice is required");
assert.match(html, /name=["']twitter:image:alt["']/, "Social preview alternative text is required");
assert.match(html, /href=["']https:\/\/tymm\.meb\.gov\.tr\/ogretim-programlari\/["'][^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["']/i, "Official-source links opened in a new tab must be isolated");
assert.match(css, /:focus-visible/, "Visible keyboard focus styles are required");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion support is required");
assert.match(css, /forced-colors:\s*active/, "Forced-colors support is required");
assert.doesNotMatch(css, /@import\s+url\(/i, "Do not load third-party stylesheets at runtime");
assert.match(css, /@media\s*\(max-width:\s*\d+px\)/, "A small-screen responsive breakpoint is required");
assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/s, "The hidden attribute must remain authoritative");
assert.match(css, /\.usage-details\s+summary/, "Usage-rights details must have a dedicated presentation");
assert.match(app, /function validMaterial\(material\)/, "Runtime material validation is required");
assert.match(app, /data\.filter\(validMaterial\)/, "Material data must pass runtime validation");
assert.match(app, /createTextNode/, "Dynamic content must be inserted as text nodes");
assert.match(app, /searchIndex:\s*normalize\(searchableText\(item\)\)/, "Search index must be prepared once per material");
assert.match(app, /history\.replaceState/, "Search and filters must be shareable through URL state");
assert.match(app, /localStorage\.setItem\("maarif-theme"/, "Manual theme preference must be persisted");
assert.match(app, /safeHttpsUrl\(material\.sourceUrl\)/, "Source links must be validated before rendering");
assert.match(app, /material\.verificationStatus !== "doğrulandı"/, "Unverified materials must not render");
assert.doesNotMatch(app, /\.innerHTML\s*=/i, "Do not inject catalogue data with innerHTML");
assert.doesNotMatch(app, /document\.write\s*\(/i, "Do not use document.write");
assert.doesNotMatch(app, /javascript:/i, "Do not use javascript: URLs");
assert.ok(Array.isArray(materials), "Materials catalogue must be a JSON array");
assert.ok(schema && schema.type === "array" && schema.items && schema.items.type === "object", "A material JSON Schema must be provided");
assert.ok(Array.isArray(schema.items.required), "Material schema must declare required fields");
for (const required of ["title", "url", "sourceName", "sourceUrl", "usageRights", "verifiedAt", "verificationStatus"]) {
  assert.ok(schema.items.required.includes(required), "Material schema must require " + required);
}
assert.equal(schema.items.properties.verificationStatus.const, "doğrulandı", "Only human-verified material may be published");
assert.ok(!/permissions:\s*write-all/i.test(workflow), "CI must not request write-all permissions");
assert.match(workflow, /node --check app\.js/, "CI must check JavaScript syntax");
assert.match(workflow, /node scripts\/validate-site\.mjs/, "CI must run site validation");
assert.ok(existsSync(resolve(root, "robots.txt")) && existsSync(resolve(root, "sitemap.xml")), "robots.txt and sitemap.xml must exist");

const baseUrl = new URL(canonical);
assert.equal(baseUrl.protocol, "https:", "Canonical URL must use HTTPS");
assert.ok(baseUrl.pathname.endsWith("/"), "Canonical URL must end with a slash");
const sitemap = read("sitemap.xml");
assert.ok(sitemap.includes(canonical), "Sitemap must include the canonical page URL");
const socialImage = html.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)/i)?.[1];
assert.ok(socialImage, "Open Graph image metadata is required");

function assertLocalPublishedFile(raw, label, base = baseUrl) {
  const url = new URL(raw, base);
  if (url.origin !== base.origin) return;
  assert.ok(url.pathname.startsWith(base.pathname), label + " must stay within the published site path");

  let pathPart = decodeURIComponent(url.pathname.slice(base.pathname.length));
  if (!pathPart || pathPart.endsWith("/")) pathPart += "index.html";
  const filePath = resolve(root, pathPart);
  const relPath = relative(root, filePath);
  assert.ok(relPath !== ".." && !relPath.startsWith(".." + sep), label + " resolves outside the repository");
  assert.ok(existsSync(filePath) && statSync(filePath).isFile(), label + " points to a missing local file: " + raw);
}

assertLocalPublishedFile(socialImage, "Open Graph share image");

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "HTML element IDs must be unique");

for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
  const raw = match[1].trim();
  if (!raw || raw.startsWith("#") || /^(?:data:|mailto:|tel:)/i.test(raw)) continue;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    assert.ok(/^https:\/\//i.test(raw), "External links must use HTTPS: " + raw);
    continue;
  }
  assertLocalPublishedFile(raw, "HTML asset/link");
}

const seenUrls = new Set();
const seenTitles = new Set();
const stringFields = [
  "description", "subject", "grade", "unit", "topic", "outcome", "outcomeCode",
  "outcomeTopic", "sourceName", "sourceUrl", "updatedAt", "format", "fileName",
  "fileSize", "academicYear", "curriculumVersion", "verifiedAt",
  "verificationStatus", "license", "usageRights"
];

function validIsoDate(value, label) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, label + " must use YYYY-MM-DD");
  const parsed = new Date(value);
  assert.ok(!Number.isNaN(parsed.getTime()), label + " must be a valid date");
  assert.equal(parsed.toISOString().slice(0, 10), value, label + " must be a real calendar date");
}

for (const [index, item] of materials.entries()) {
  const label = "Material " + (index + 1);
  assert.ok(item && typeof item === "object" && !Array.isArray(item), label + " must be an object");
  assert.ok(typeof item.title === "string" && item.title.trim(), label + " needs a title");
  assert.ok(item.title.trim().length <= 180, label + " title must be 180 characters or fewer");
  assert.ok(typeof item.url === "string" && item.url.trim(), label + " needs a URL");
  assert.ok(typeof item.sourceName === "string" && item.sourceName.trim(), label + " needs a sourceName");
  assert.ok(typeof item.sourceUrl === "string" && item.sourceUrl.trim(), label + " needs a sourceUrl");
  assert.ok(typeof item.usageRights === "string" && item.usageRights.trim(), label + " needs explicit usageRights");
  assert.equal(item.verificationStatus, "doğrulandı", label + " must be explicitly verified before publication");
  assert.ok(typeof item.verifiedAt === "string", label + " needs a verifiedAt date");
  validIsoDate(item.verifiedAt, label + " verifiedAt");

  const raw = item.url.trim();
  assert.ok(!raw.startsWith("//"), label + " must not use a protocol-relative URL");
  assert.ok(!/[\u0000-\u001f]/.test(raw), label + " URL contains control characters");
  assert.ok(!/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^https:\/\//i.test(raw), label + " absolute URL must use HTTPS");

  let resolved;
  try {
    resolved = new URL(raw, baseUrl);
  } catch {
    assert.fail(label + " URL is invalid");
  }
  assert.equal(resolved.protocol, "https:", label + " must resolve to HTTPS");
  assert.ok(!resolved.username && !resolved.password, label + " URL must not contain credentials");
  assert.ok(raw !== "#" && raw !== "./" && raw !== baseUrl.pathname, label + " must point to a material, not the site root");

  if (!/^https:\/\//i.test(raw)) assertLocalPublishedFile(raw, label + " local material URL");

  const normalizedUrl = resolved.href;
  assert.ok(!seenUrls.has(normalizedUrl), label + " duplicates a previous URL");
  seenUrls.add(normalizedUrl);

  const normalizedTitle = item.title.trim().toLocaleLowerCase("tr-TR");
  assert.ok(!seenTitles.has(normalizedTitle), label + " duplicates a previous title");
  seenTitles.add(normalizedTitle);

  for (const field of stringFields) {
    if (item[field] !== undefined) assert.equal(typeof item[field], "string", label + " field " + field + " must be a string");
  }

  if (item.keywords !== undefined) {
    assert.ok(Array.isArray(item.keywords) && item.keywords.every((word) => typeof word === "string"), label + " keywords must be an array of strings");
  }

  const sourceUrl = new URL(item.sourceUrl);
  assert.equal(sourceUrl.protocol, "https:", label + " sourceUrl must use HTTPS");
  assert.ok(!sourceUrl.username && !sourceUrl.password, label + " sourceUrl must not contain credentials");

  if (item.updatedAt) validIsoDate(item.updatedAt, label + " updatedAt");
  assert.ok(item.sourceName.length <= 160, label + " sourceName is too long");
  assert.ok(item.usageRights.length <= 500, label + " usageRights is too long");
}

console.log("Site validation passed: HTML structure, unique IDs, local assets, accessibility hooks, URL safety, editorial metadata, schema, and CI permissions checked.");
if (materials.length === 0) {
  console.warn("NOTICE: catalogue is intentionally empty. Add only source-attributed, rights-reviewed, human-verified materials before publishing records.");
}
