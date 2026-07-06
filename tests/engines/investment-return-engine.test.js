import test from "node:test";
import assert from "node:assert/strict";
import { runInvestmentReturnEngine } from "../../assets/js/engines/investment-return-engine.js";

test("投資回収Engineは営業利益区分で回収指標を計算する", () => {
  const result = runInvestmentReturnEngine({ screenManual: { investmentAmount: 2_000, annualIncrementalCashFlow: 400, annualOperatingProfitBeforeInvestment: 100, annualOperatingProfitAfterInvestment: 500, annualRunningCost: 100, targetPaybackYears: 4 } });
  assert.equal(result.results.operatingProfitAfterRunningCost, 400);
  assert.equal(result.results.paybackPeriod, 5);
  assert.equal(result.results.roi, 0.15);
  assert.equal(result.results.requiredAnnualOperatingProfit, 500);
});

test("採用投資額を検証・丸めし後続計算へ使用する", () => {
  const rounded = runInvestmentReturnEngine({ screenManual: {
    investmentAmount: 100.5, annualIncrementalCashFlow: 100, annualOperatingProfitBeforeInvestment: 0, annualOperatingProfitAfterInvestment: 100,
    annualRunningCost: 0, targetPaybackYears: 1
  } });
  assert.equal(rounded.results.investmentAmount, 101);
  assert.equal(rounded.results.paybackPeriod, 1.01);
  assert.equal(rounded.results.requiredAnnualOperatingProfit, 101);

  const negative = runInvestmentReturnEngine({ screenManual: { investmentAmount: -1 } });
  assert.equal(negative.results.investmentAmount, null);
  assert.equal(negative.errors.some(({ code }) => code === "NON_NEGATIVE_REQUIRED"), true);
});
