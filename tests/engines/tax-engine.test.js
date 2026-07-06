import test from "node:test";
import assert from "node:assert/strict";
import { runTaxEngine } from "../../assets/js/engines/tax-engine.js";

test("税金Engineは標準実効税率と基準日を使用する", () => {
  const result = runTaxEngine({ screenManual: { incomeBeforeTax: 101 } });
  assert.equal(result.results.effectiveTaxRate, 0.3);
  assert.equal(result.results.corporateTaxEstimate, 30);
  assert.equal(result.results.profitAfterTax, 71);
  assert.equal(result.usedInputs.corporateTaxEstimate.rateBaseDate, "2026-07-01");
});

test("税引前当期純利益0以下は法人税等概算0円", () => {
  assert.equal(runTaxEngine({ screenManual: { incomeBeforeTax: 0 } }).results.corporateTaxEstimate, 0);
  assert.equal(runTaxEngine({ screenManual: { incomeBeforeTax: -100 } }).results.corporateTaxEstimate, 0);
});

test("採用した税引前当期純利益を丸め、実効税率を検証する", () => {
  const rounded = runTaxEngine({ screenManual: { incomeBeforeTax: -10.5 } });
  assert.equal(rounded.results.incomeBeforeTax, -11);
  assert.equal(rounded.results.corporateTaxEstimate, 0);
  assert.equal(rounded.results.profitAfterTax, -11);

  const invalidRate = runTaxEngine({ screenManual: { incomeBeforeTax: 100, effectiveTaxRate: 1.1 } });
  assert.equal(invalidRate.results.effectiveTaxRate, null);
  assert.equal(invalidRate.errors.some(({ code }) => code === "RATE_OUT_OF_RANGE"), true);
});
