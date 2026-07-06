import test from "node:test";
import assert from "node:assert/strict";
import { calculateScenarioOperatingProfit } from "../../assets/js/calculators/break-even.js";
import { calculateGrossProfitAfterPriceChange } from "../../assets/js/calculators/pricing.js";
import { calculateOperatingProfitAfterHiring } from "../../assets/js/calculators/labor-cost.js";
import { calculateDscr, calculateTotalInterestBearingDebt, calculateSimpleRepaymentCashFlow, calculateDebtRepaymentYears } from "../../assets/js/calculators/loan-repayment.js";
import { calculateIncrementalOperatingProfit, calculatePaybackPeriod, calculateReturnOnInvestment } from "../../assets/js/calculators/investment-return.js";
import { calculateElapsedYearsActAct, calculateCagr } from "../../assets/js/calculators/growth.js";

test("8契約の正常値を計算する", () => {
  assert.equal(calculateScenarioOperatingProfit(20_000_000, 0.4, 6_000_000).value, 2_000_000);
  assert.equal(calculateGrossProfitAfterPriceChange(1_200, 500, 900).value, 630_000);
  assert.equal(calculateOperatingProfitAfterHiring(2_000_000, 5_000_000, 0.4, 1_500_000).value, 2_500_000);
  assert.equal(calculateDscr(3_000_000, 2_000_000).value, 1.5);
  assert.equal(calculateTotalInterestBearingDebt(2_000_000, 8_000_000).value, 10_000_000);
  assert.equal(calculateSimpleRepaymentCashFlow(1_500_000, 500_000).value, 2_000_000);
  assert.equal(calculateDebtRepaymentYears(10_000_000, 2_000_000).value, 5);
  const incremental = calculateIncrementalOperatingProfit(5_000_000, 2_000_000, 500_000).value;
  assert.equal(incremental, 2_500_000);
  assert.equal(calculatePaybackPeriod(10_000_000, 2_000_000).value, 5);
  assert.equal(calculateReturnOnInvestment(incremental, 10_000_000).value, 0.25);
  assert.equal(calculateElapsedYearsActAct("2024-02-29", "2025-02-28").value, 1);
  assert.ok(Math.abs(calculateCagr(100, 121, 2).value - 0.1) < 1e-12);
});

test("不足と0分母を区別する", () => {
  assert.equal(calculatePaybackPeriod(10_000_000, null).missingFields.length, 1);
  assert.equal(calculatePaybackPeriod(10_000_000, 0).errors.length, 1);
  assert.equal(calculateDscr(1_000_000, 0).errors.length, 1);
  assert.equal(calculateDebtRepaymentYears(10_000_000, 0).errors.length, 1);
});

test("CAGR期間は日付形式・順序を検証する", () => {
  assert.equal(calculateElapsedYearsActAct("", "2025-01-01").missingFields.length, 1);
  assert.equal(calculateElapsedYearsActAct("2025-02-30", "2026-01-01").errors.length, 1);
  assert.equal(calculateElapsedYearsActAct("2025-01-01", "2025-01-01").errors.length, 1);
});
