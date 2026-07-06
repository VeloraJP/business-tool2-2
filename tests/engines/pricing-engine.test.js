import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS, TAX_ACCOUNTING_BASIS } from "../../assets/js/config/constants.js";
import { runPricingEngine } from "../../assets/js/engines/pricing-engine.js";

test("価格Engineは必要数量と目標営業利益達成価格を計算する", () => {
  const result = runPricingEngine({ screenManual: { currentPrice: 1_000, changedPrice: 900, reducedPrice: 900, unitCost: 600, changedUnitCost: 700, currentUnitCost: 600, salesQuantity: 10, expectedQuantityAfterPriceChange: 10, fixedCostsExcludingLabor: 1_000, laborCosts: 500, otherVariableCosts: 500, targetOperatingProfit: 2_000 }, units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.YEN], taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED, TAX_ACCOUNTING_BASIS.EXCLUDED] });
  assert.equal(result.results.currentGrossProfit, 4_000);
  assert.equal(result.results.requiredQuantity, 20);
  assert.equal(result.results.requiredPriceForTargetOperatingProfit, 1_000);
  assert.equal(result.errors.length, 0);
});

test("価格Engineは税区分不一致をErrorにする", () => {
  const result = runPricingEngine({ taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED, TAX_ACCOUNTING_BASIS.INCLUDED] });
  assert.equal(result.errors.some(({ code }) => code === "TAX_BASIS_MISMATCH"), true);
});

test("価格Engineは税区分・単位の未指定を不足、一致を正常、不一致をErrorにする", () => {
  const missing = runPricingEngine();
  assert.equal(missing.missingFields.some(({ resultName }) => resultName === "taxAccountingBasis"), true);
  assert.equal(missing.missingFields.some(({ resultName }) => resultName === "amountInputUnit"), true);

  const valid = runPricingEngine({
    taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED, TAX_ACCOUNTING_BASIS.EXCLUDED],
    units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.YEN]
  });
  assert.equal(valid.errors.some(({ code }) => code === "UNIT_MISMATCH" || code === "TAX_BASIS_MISMATCH"), false);

  const invalid = runPricingEngine({
    taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED, TAX_ACCOUNTING_BASIS.INCLUDED],
    units: [AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.THOUSAND_YEN]
  });
  assert.equal(invalid.errors.some(({ code }) => code === "TAX_BASIS_MISMATCH"), true);
  assert.equal(invalid.errors.some(({ code }) => code === "UNIT_MISMATCH"), true);

  const adapted = runPricingEngine({ derived: {
    taxAccountingBasis: TAX_ACCOUNTING_BASIS.EXCLUDED,
    amountInputUnit: AMOUNT_INPUT_UNITS.YEN
  } });
  assert.equal(adapted.missingFields.some(({ resultName }) => resultName === "taxAccountingBasis" || resultName === "amountInputUnit"), false);
});
