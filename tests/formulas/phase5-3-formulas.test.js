import test from "node:test";
import assert from "node:assert/strict";
import { scenarioOperatingProfit } from "../../assets/js/formulas/break-even.js";
import { grossProfitAfterPriceChange } from "../../assets/js/formulas/pricing.js";
import { operatingProfitAfterHiring } from "../../assets/js/formulas/labor-cost.js";
import { dscr, totalInterestBearingDebt, simpleRepaymentCashFlow, debtRepaymentYears } from "../../assets/js/formulas/loan-repayment.js";
import { incrementalOperatingProfit, paybackPeriod, returnOnInvestment } from "../../assets/js/formulas/investment-return.js";
import { elapsedYearsActAct, cagr } from "../../assets/js/formulas/growth.js";

test("SIM-03 シナリオ営業利益", () => {
  assert.equal(scenarioOperatingProfit(20_000_000, 0.4, 6_000_000), 2_000_000);
});

test("SIM-07 変更後原価と想定数量を使う", () => {
  assert.equal(grossProfitAfterPriceChange(1_200, 500, 900), 630_000);
});

test("SIM-12 想定追加売上を採用後営業利益へ反映する", () => {
  assert.equal(operatingProfitAfterHiring(2_000_000, 5_000_000, 0.4, 1_500_000), 2_500_000);
});

test("SIM-14・15 借入指標の正式式", () => {
  assert.equal(dscr(3_000_000, 2_000_000), 1.5);
  assert.equal(totalInterestBearingDebt(2_000_000, 8_000_000), 10_000_000);
  assert.equal(simpleRepaymentCashFlow(1_500_000, 500_000), 2_000_000);
  assert.equal(debtRepaymentYears(10_000_000, 2_000_000), 5);
});

test("SIM-17・18 投資回収とROIの分子を分離する", () => {
  const incremental = incrementalOperatingProfit(5_000_000, 2_000_000, 500_000);
  assert.equal(incremental, 2_500_000);
  assert.equal(paybackPeriod(10_000_000, 2_000_000), 5);
  assert.equal(returnOnInvestment(incremental, 10_000_000), 0.25);
});

test("SIM-23 ACT/ACTは満暦年とうるう日を扱う", () => {
  assert.equal(elapsedYearsActAct("2024-02-29", "2025-02-28"), 1);
  assert.equal(elapsedYearsActAct("2023-06-30", "2026-06-30"), 3);
  const years = elapsedYearsActAct("2024-01-01", "2025-07-02");
  assert.ok(years > 1.49 && years < 1.51);
  assert.ok(Math.abs(cagr(100, 121, 2) - 0.1) < 1e-12);
});
