import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ENGINE_RESULT_KEYS } from "../assets/js/engines/contract.js";
import { runSalesEngine } from "../assets/js/engines/sales-engine.js";
import { runTaxEngine } from "../assets/js/engines/tax-engine.js";

const root = fileURLToPath(new URL("..", import.meta.url));

test("個別EngineはCalculatorだけへ接続しFormula・別Engineへ直接依存しない", async () => {
  const directory = join(root, "assets/js/engines");
  const files = (await readdir(directory)).filter((name) => name.endsWith("-engine.js"));
  assert.equal(files.length, 12);
  for (const file of files) {
    const source = await readFile(join(directory, file), "utf8");
    assert.doesNotMatch(source, /from\s+["']\.\.\/formulas\//, file);
    assert.doesNotMatch(source, /from\s+["']\.\/.+-engine\.js/, file);
    assert.doesNotMatch(source, /\b(document|window|localStorage|sessionStorage|Repository|Router|View)\b/, file);
    assert.match(source, /\.\.\/calculators\//, file);
  }
});

test("複数Engineは互いの結果を変更せず独立実行できる", () => {
  const sales = runSalesEngine({ screenManual: { customerUnitPrice: 100, customerCount: 2 } });
  const before = structuredClone(sales);
  const tax = runTaxEngine({ screenManual: { incomeBeforeTax: 100 } });
  assert.deepEqual(sales, before);
  assert.equal(tax.results.corporateTaxEstimate, 30);
  assert.deepEqual(Object.keys(sales), ENGINE_RESULT_KEYS);
  assert.deepEqual(Object.keys(tax), ENGINE_RESULT_KEYS);
});

test("Phase 4のViewからEngineを直接参照しない", async () => {
  const entries = await readdir(join(root, "assets/js"), { withFileTypes: true });
  const names = entries.map(({ name }) => name.toLowerCase());
  assert.equal(names.includes("views"), true);
  const companyDirectory = join(root, "assets/js/views/company");
  const companyViews = (await readdir(companyDirectory)).filter((name) => name.endsWith(".js"));
  for (const file of companyViews) {
    assert.doesNotMatch(await readFile(join(companyDirectory, file), "utf8"), /\/engines\//, file);
  }
});
