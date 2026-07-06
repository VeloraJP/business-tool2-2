import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function files(directory) {
  return (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
}

test("Phase 5 ViewはEngine・Calculator・Formula・保存層を直接参照しない", async () => {
  const directory = "assets/js/views/categories";
  for (const file of await files(directory)) {
    const source = await readFile(join(root, directory, file), "utf8");
    assert.doesNotMatch(source, /\/engines\/|\/calculators\/|\/formulas\/|\/storage\//, file);
  }
});

test("Phase 5 Controllerは共通Engine入口だけを参照する", async () => {
  const source = await readFile(join(root, "assets/js/controllers/category-analysis-controller.js"), "utf8");
  assert.match(source, /engines\/engine-runner\.js/);
  assert.doesNotMatch(source, /engines\/(?!engine-runner)[^\"]+-engine\.js|\/formulas\/|\/calculators\//);
});

test("P5-PRE-01に従い目標当期純利益の逆算を実装しない", async () => {
  const targets = [
    "assets/js/config/categories.js",
    "assets/js/controllers/category-analysis-controller.js",
    "assets/js/views/categories/target-view.js"
  ];
  for (const file of targets) {
    const source = await readFile(join(root, file), "utf8");
    assert.doesNotMatch(source, /targetNetProfit|targetNetIncome|目標当期純利益|inverseTax/i, file);
  }
});

