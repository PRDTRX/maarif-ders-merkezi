import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync("index.html", "utf8");
const app = readFileSync("app.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const materials = JSON.parse(readFileSync("data/materials.json", "utf8"));

assert.match(html, /<!doctype html>/i, "HTML5 doctype is required");
assert.match(html, /<html[^>]+lang=["']tr["']/i, "Document language must be Turkish");
assert.match(html, /<meta charset=["']utf-8["']/i, "UTF-8 charset is required");
assert.match(html, /<meta name=["']viewport["']/i, "Responsive viewport is required");
assert.match(html, /<title>[^<]+<\/title>/i, "Page title is required");
assert.match(html, /<meta name=["']description["']/i, "Meta description is required");
assert.match(html, /rel=["']canonical["']/i, "Canonical URL is required");
assert.match(html, /id=["']main["']/i, "Main content target is required for skip link");
assert.match(html, /class=["']skip-link["']/i, "Keyboard skip link is required");
assert.match(html, /<h1\b/i, "A primary heading is required");
assert.doesNotMatch(html, /<h1\b[^>]*>[\s\S]*?<h1\b/i, "Avoid repeated h1 elements");
assert.match(css, /:focus-visible/, "Visible keyboard focus styles are required");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion support is required");
assert.match(app, /function validMaterial\(m\)/, "Material URL validation is required");
assert.match(app, /data\.filter\(validMaterial\)/, "Material data must pass validation");
assert.ok(Array.isArray(materials), "Materials catalogue must be a JSON array");

const sameOrigin = "https://prdtrx.github.io";
const basePath = "/maarif-ders-merkezi/";
for (const [index, item] of materials.entries()) {
  assert.ok(item && typeof item === "object" && !Array.isArray(item), `Material ${index} must be an object`);
  assert.ok(typeof item.title === "string" && item.title.trim(), `Material ${index} needs a title`);
  assert.ok(typeof item.url === "string" && item.url.trim(), `Material ${index} needs a URL`);
  const raw = item.url.trim();
  assert.ok(!raw.startsWith("//"), `Material ${index} must not use a protocol-relative URL`);
  assert.ok(!/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^https:\/\//i.test(raw), `Material ${index} must use HTTPS for absolute URLs`);
  const resolved = new URL(raw, sameOrigin + basePath);
  assert.equal(resolved.protocol, "https:", `Material ${index} must resolve to HTTPS`);
  assert.ok(/^https:\/\//i.test(raw) || resolved.origin === sameOrigin, `Material ${index} relative URL must stay same-origin`);
}

console.log(`Site validation passed. ${materials.length} material record(s) checked.`);
