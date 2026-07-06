import test from "node:test";
import assert from "node:assert/strict";
import { runBreakEvenEngine } from "../../assets/js/engines/break-even-engine.js";

test("損益分岐点Engineは標準分類と各結果を返す", () => {
  const result = runBreakEvenEngine({ screenManual: { salesAmount: 1_000, variableCosts: 400, fixedCosts: 300, targetOperatingProfit: 120 } });
  assert.equal(result.results.marginalProfit, 600);
  assert.equal(result.results.breakEvenSales, 500);
  assert.equal(result.results.requiredSalesForTargetOperatingProfit, 700);
  assert.equal(result.inputSources.costClassifications.type, "STANDARD_CLASSIFICATION");
});

test("PL費用項目を標準分類とMANUAL分類で再集計しPL009を除外する", () => {
  const pl = {
    PL002: 400, PL004: 50, PL005: 100, PL006: 20, PL008: 30, PL009: 999,
    PL010: 10, PL011: 10, PL012: 10, PL013: 10, PL014: 20, PL015: 40
  };
  const standard = runBreakEvenEngine({
    screenManual: { salesAmount: 1_000, targetOperatingProfit: 100, ...pl }
  });
  assert.equal(standard.usedInputs.marginalProfit.variableCosts, 440);
  assert.equal(standard.usedInputs.breakEvenSales.fixedCosts, 260);
  assert.equal(standard.results.breakEvenSales, 464);
  assert.equal(standard.inputSources.marginalProfit.variableCosts.detail.classificationSource, "STANDARD_CLASSIFICATION");

  const manual = runBreakEvenEngine({
    screenManual: { salesAmount: 1_000, targetOperatingProfit: 100, ...pl },
    costClassifications: { PL004: "VARIABLE" }
  });
  assert.equal(manual.usedInputs.marginalProfit.variableCosts, 490);
  assert.equal(manual.usedInputs.breakEvenSales.fixedCosts, 210);
  assert.equal(manual.inputSources.costClassifications.type, "SCREEN_MANUAL");
});
