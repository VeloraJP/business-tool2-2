import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STANDARD_EFFECTIVE_TAX_RATE,
  STANDARD_RATE_BASE_DATE,
  STANDARD_SOCIAL_INSURANCE_RATE,
} from "../assets/js/config/constants.js";

const root = fileURLToPath(new URL("..", import.meta.url));

async function sourceFiles(directory) {
  return (await readdir(join(root, directory)))
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(root, directory, name));
}

test("Formula・CalculatorはDOM・保存・画面状態へ依存しない", async () => {
  const files = [
    ...(await sourceFiles("assets/js/formulas")),
    ...(await sourceFiles("assets/js/calculators")),
  ];
  const forbidden = /\b(document|window|localStorage|sessionStorage|Repository|Store|Router|View|Engine)\b/;
  for (const file of files) {
    assert.doesNotMatch(await readFile(file, "utf8"), forbidden, file);
  }
});

test("Phase 4画面はFormula・Calculatorを直接参照しない", async () => {
  const jsRoot = join(root, "assets/js");
  const entries = await readdir(jsRoot, { withFileTypes: true });
  const names = entries.map(({ name }) => name.toLowerCase());
  assert.equal(names.includes("engines"), true);
  assert.equal(names.includes("views"), true);
  const viewFiles = [
    ...(await sourceFiles("assets/js/views")),
    ...(await sourceFiles("assets/js/views/company"))
  ];
  for (const file of viewFiles) {
    assert.doesNotMatch(await readFile(file, "utf8"), /\/formulas\/|\/calculators\//, file);
  }
});

test("標準料率と基準日が凍結仕様と一致する", () => {
  assert.equal(STANDARD_SOCIAL_INSURANCE_RATE, 0.15);
  assert.equal(STANDARD_EFFECTIVE_TAX_RATE, 0.3);
  assert.equal(STANDARD_RATE_BASE_DATE, "2026-07-01");
});
