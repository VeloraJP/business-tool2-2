import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SIMULATIONS, SIMULATIONS_BY_CATEGORY } from "../../assets/js/config/simulation-results.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const source = (path) => readFile(join(root, path), "utf8");

test("24シミュレーションはPrimary KPIを各1候補以上持つ", () => {
  assert.equal(SIMULATIONS.length, 24);
  assert.deepEqual(Object.values(SIMULATIONS_BY_CATEGORY).map((items) => items.length).sort((a, b) => a - b), [2, 2, 2, 2, 3, 4, 4, 5]);
  for (const simulation of SIMULATIONS) {
    assert.ok(simulation.primaryResults.length >= 1);
    assert.ok(simulation.supportingResults.length <= 3);
    assert.ok(simulation.question.length > 0);
  }
});

test("結果画面は結論・Primary KPI・意味・前提・注意・次の操作・詳細の順", async () => {
  const text = await source("assets/js/components/result-screen.js");
  const tokens = ["decision-result__conclusion", "renderResultCard(primary", "この結果の意味", "前提条件", "注意事項", "条件を変えて確認", "詳しく見る"];
  const positions = tokens.map((token) => text.indexOf(token));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("UI層は計算層・保存層へ直接依存しない", async () => {
  for (const directory of ["assets/js/views", "assets/js/components"]) {
    const files = (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
    for (const file of files) {
      assert.doesNotMatch(await source(join(directory, file)), /\/engines\/|\/formulas\/|\/calculators\/|\/storage\//, file);
    }
  }
});

test("業界参考値・断定評価・内部コードを結果UIへ表示しない", async () => {
  const forbidden = /業界参考値|良い会社|悪い会社|投資すべき|借りるべき|星評価|ランキング|分析精度/;
  for (const file of ["assets/js/components/result-screen.js", "assets/js/components/result-card.js", "assets/js/views/categories/category-view.js"]) {
    const text = await source(file);
    assert.doesNotMatch(text, forbidden, file);
    assert.doesNotMatch(text, /\b(?:PL|BS|MG)\d{3}\b/, file);
  }
});
