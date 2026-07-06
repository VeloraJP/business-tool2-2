import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function sha256(relativePath) {
  const contents = await readFile(path.join(projectRoot, relativePath));
  return createHash("sha256").update(contents).digest("hex");
}

test("HTMLは外部CSSとES Moduleを読み込む", async () => {
  const html = await read("index.html");

  assert.doesNotMatch(html, /<style(?:\s|>)/i);
  assert.doesNotMatch(html, /<script(?![^>]*type=["']module["'])/i);

  for (const file of [
    "tokens.css",
    "base.css",
    "layout.css",
    "components.css",
    "responsive.css",
    "print.css"
  ]) {
    assert.match(html, new RegExp(`assets/css/${file.replace(".", "\\.")}`));
  }

  assert.match(html, /<script type="module" src="\.\/assets\/js\/app\.js"><\/script>/);
});

test("Phase 0の本番実行経路に旧対象外ロジックがない", async () => {
  const sources = [
    await read("index.html"),
    await read("assets/js/app.js"),
    await read("assets/css/components.css")
  ].join("\n");

  for (const forbidden of [
    "BENCH",
    "buildForecast",
    "forecastHtml",
    "standardize",
    "業界平均",
    "総合評価",
    "消費税の比較"
  ]) {
    assert.equal(sources.includes(forbidden), false, `対象外トークンを検出: ${forbidden}`);
  }
});

test("Phase 0で保持するPWA資産は原本と一致する", async () => {
  const expected = {
    "manifest.webmanifest": "af4322c555de0d46f49fea71d76932cbb8f3fb377718f4e34db56d5bdeb24791",
    "sw.js": "73b6e7b5e3e9da39b62a10cd6a57e057d0b6cb336c525caa780c69cc50087160",
    "icon.svg": "d7f2dc9dcdd9fbef55a9d26a7d3a4a5784af3d546690ae6c9d2d3844e1fb83fe",
    "apple-touch-icon.png": "245658d1cd0b9ed7c8cedde916d01f2600f8a9b947207f5a60fbc07f41a8df37"
  };

  for (const [file, hash] of Object.entries(expected)) {
    assert.equal(await sha256(file), hash, `原本と不一致: ${file}`);
  }
});

test("Phase 4の起動点はController・Router・Viewを合成し計算層を直接参照しない", async () => {
  const app = await read("assets/js/app.js");
  assert.match(app, /CompanyDataController/);
  assert.match(app, /HashRouter/);
  assert.match(app, /renderCompanyView/);
  assert.doesNotMatch(app, /\/formulas\/|\/calculators\//);
});
