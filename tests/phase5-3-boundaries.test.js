import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = (path) => readFile(join(root, path), "utf8");

test("8件の計算はView・Controllerへ重複実装しない", async () => {
  const view = await source("assets/js/components/result-screen.js");
  const controller = await source("assets/js/controllers/category-analysis-controller.js");
  for (const text of [view, controller]) {
    assert.doesNotMatch(text, /scenarioSalesAmount\s*\*|expectedAdditionalSales\s*\*|annualPreDebtServiceCashFlow\s*\/|investmentAmount\s*\/|\*\*\s*\(1\s*\//);
  }
});

test("業界平均を入力・結果・保存契約へ追加しない", async () => {
  for (const file of ["assets/js/config/categories.js", "assets/js/config/simulation-results.js", "assets/js/components/source-badge.js"]) {
    assert.doesNotMatch(await source(file), /industry|業界平均|業界参考値/i, file);
  }
});

test("Service Worker・manifest・Storage・RepositoryはPhase5.3対象外のまま", async () => {
  const planned = await source("../outputs/Phase5.3開始準備/03_変更予定ファイル一覧.md");
  for (const item of ["manifest.webmanifest", "sw.js", "assets/js/storage/**", "assets/js/storage/repository.js"]) {
    assert.match(planned, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
