import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS, LOAN_REPAYMENT_METHODS, TAX_ACCOUNTING_BASIS } from "../../assets/js/config/constants.js";
import { runBreakEvenEngine } from "../../assets/js/engines/break-even-engine.js";
import { runPricingEngine } from "../../assets/js/engines/pricing-engine.js";
import { runLaborCostEngine } from "../../assets/js/engines/labor-cost-engine.js";
import { runLoanRepaymentEngine } from "../../assets/js/engines/loan-repayment-engine.js";
import { runInvestmentReturnEngine } from "../../assets/js/engines/investment-return-engine.js";
import { runGrowthEngine } from "../../assets/js/engines/growth-engine.js";

const commonKeys = ["results", "errors", "warnings", "missingFields", "calculationBasis", "usedInputs", "inputSources"];

test("SIM-03・07・12は正式結果を返す", () => {
  const scenario = runBreakEvenEngine({ screenManual: { salesAmount: 10_000, variableCosts: 6_000, fixedCosts: 2_000, scenarioSalesAmount: 20_000, scenarioFixedCosts: 6_000 } });
  assert.equal(scenario.results.scenarioOperatingProfit, 2_000);

  const pricing = runPricingEngine({
    screenManual: { currentPrice: 1_000, changedPrice: 1_200, currentUnitCost: 400, changedUnitCost: 500, salesQuantity: 1_000, expectedQuantityAfterPriceChange: 900 },
    units: [AMOUNT_INPUT_UNITS.YEN], taxBases: [TAX_ACCOUNTING_BASIS.EXCLUDED]
  });
  assert.equal(pricing.results.grossProfitAfterPriceChange, 630_000);

  const hiring = runLaborCostEngine({ screenManual: { currentOperatingProfit: 2_000_000, expectedAdditionalSales: 5_000_000, marginalProfitRate: 0.4, expectedSalaryPerPerson: 1_000_000, plannedHireCount: 1 } });
  assert.equal(hiring.results.operatingProfitAfterHiring, 2_850_000);
});

test("SIM-14・15は正式借入指標を返す", () => {
  const result = runLoanRepaymentEngine({ screenManual: {
    loanAmount: 1_200_000, interestRate: 0, repaymentMonths: 12, repaymentMethod: LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT,
    annualPreDebtServiceCashFlow: 2_400_000, shortTermBorrowings: 2_000_000, longTermBorrowings: 8_000_000,
    operatingProfit: 1_500_000, depreciation: 500_000
  } });
  assert.equal(result.results.dscr, 2);
  assert.equal(result.results.totalInterestBearingDebt, 10_000_000);
  assert.equal(result.results.simpleRepaymentCashFlow, 2_000_000);
  assert.equal(result.results.debtRepaymentYears, 5);
});

test("SIM-17・18は増分CFと増分営業利益を分離する", () => {
  const result = runInvestmentReturnEngine({ screenManual: {
    investmentAmount: 10_000_000, annualIncrementalCashFlow: 2_000_000,
    annualOperatingProfitBeforeInvestment: 2_000_000, annualOperatingProfitAfterInvestment: 5_000_000,
    annualRunningCost: 500_000, targetPaybackYears: 5
  } });
  assert.equal(result.results.paybackPeriod, 5);
  assert.equal(result.results.annualIncrementalOperatingProfit, 2_500_000);
  assert.equal(result.results.roi, 0.25);
});

test("SIM-23は期末日からACT/ACT経過年数を返す", () => {
  const result = runGrowthEngine({ screenManual: {
    metric: "salesAmount", previousValue: 100, currentValue: 121, initialValue: 100, finalValue: 121,
    sourcePeriodEnd: "2024-02-29", targetPeriodEnd: "2026-02-28", periods: ["2024", "2026"]
  } });
  assert.equal(result.results.elapsedYears, 2);
  assert.ok(Math.abs(result.results.cagr - 0.1) < 1e-12);
});

test("全対象Engineは共通返却形式を維持する", () => {
  for (const result of [runBreakEvenEngine(), runPricingEngine(), runLaborCostEngine(), runLoanRepaymentEngine(), runInvestmentReturnEngine(), runGrowthEngine()]) {
    assert.deepEqual(commonKeys.filter((key) => !Object.hasOwn(result, key)), []);
  }
});
