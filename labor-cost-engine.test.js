import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS, TAX_ACCOUNTING_BASIS } from "../../assets/js/config/constants.js";
import { runComparisonEngine } from "../../assets/js/engines/comparison-engine.js";

test("比較Engineは差額・増減率・構成比を返す", () => {
  const result = runComparisonEngine({ screenManual: { sourceValue: 100, targetValue: 120, itemValue: 30, totalValue: 100, periods: ["2025", "2026"] }, units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.YEN], taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED, TAX_ACCOUNTING_BASIS.EXCLUDED] });
  assert.equal(result.results.difference, 20);
  assert.equal(result.results.changeRate, 0.2);
  assert.equal(result.results.compositionRate, 0.3);
});

test("意味・期間不一致はWarning、単位不一致はErrorにする", () => {
  const result = runComparisonEngine({ sameMeaning: false, samePeriodLength: false, units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.THOUSAND_YEN] });
  assert.equal(result.warnings.length, 2);
  assert.equal(result.errors.some(({ code }) => code === "UNIT_MISMATCH"), true);
});

test("比較Engineは税区分・単位の未指定と不一致を分類する", () => {
  const missing = runComparisonEngine();
  assert.equal(missing.missingFields.some(({ resultName }) => resultName === "taxAccountingBasis"), true);
  assert.equal(missing.missingFields.some(({ resultName }) => resultName === "amountInputUnit"), true);

  const mismatch = runComparisonEngine({
    units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.THOUSAND_YEN],
    taxBases: [TAX_ACCOUNTING_BASIS.INCLUDED, TAX_ACCOUNTING_BASIS.EXCLUDED]
  });
  assert.equal(mismatch.errors.some(({ code }) => code === "UNIT_MISMATCH"), true);
  assert.equal(mismatch.errors.some(({ code }) => code === "TAX_BASIS_MISMATCH"), true);
});
