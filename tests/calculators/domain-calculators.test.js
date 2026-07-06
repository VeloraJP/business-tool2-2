import test from "node:test";
import assert from "node:assert/strict";
import * as sales from "../../assets/js/calculators/sales.js";
import * as profit from "../../assets/js/calculators/profit.js";
import * as breakEven from "../../assets/js/calculators/break-even.js";
import * as pricing from "../../assets/js/calculators/pricing.js";
import * as labor from "../../assets/js/calculators/labor-cost.js";
import * as cash from "../../assets/js/calculators/cash-flow.js";
import * as investment from "../../assets/js/calculators/investment-return.js";
import * as financial from "../../assets/js/calculators/financial-analysis.js";
import * as comparison from "../../assets/js/calculators/comparison.js";
import * as growth from "../../assets/js/calculators/growth.js";
import * as tax from "../../assets/js/calculators/tax.js";

test("売上Calculatorは0を入力済みとし、必要数量を切り上げる", () => {
  assert.equal(sales.calculateSalesFromCustomers(0, 0).value, 0);
  assert.equal(sales.calculateRequiredCustomerCount(10_001, 2_000).value, 6);
  assert.equal(sales.calculateCustomerUnitPrice(100, 0).errors[0].code, "POSITIVE_REQUIRED");
  assert.equal(sales.calculateDailySales(100, "").missingFields[0].field, "businessDays");
  assert.equal(sales.calculateCustomerUnitPrice(101, 2).value, 51);
});

test("損益Calculatorは営業赤字を許容し、費用の負値を拒否する", () => {
  assert.equal(profit.calculateOperatingProfit(100, 120).value, -20);
  assert.equal(profit.calculateGrossProfit(100, -1).value, null);
  assert.equal(profit.calculateSellingGeneralAndAdministrativeExpenses({ laborCost: 10, rent: 20, utilities: 0, advertising: 0, fees: 0, depreciation: 0, otherFixedCosts: 0, otherVariableCosts: 0 }).value, 30);
  assert.equal(profit.calculateOperatingProfitRate(-10, 100).value, -0.1);
});

test("損益分岐点Calculatorは限界利益率0以下を拒否する", () => {
  assert.equal(breakEven.calculateBreakEvenSales(300, 0.6).value, 500);
  assert.equal(breakEven.calculateBreakEvenSales(300, 0).errors[0].code, "POSITIVE_REQUIRED");
  assert.equal(breakEven.calculateMarginOfSafetyRate(0, 0).value, null);
});

test("損益分岐点Calculatorは分類に従って費用を集計しPL009を除外する", () => {
  const values = { PL002: 400, PL004: 10, PL009: 999, PL015: 20 };
  const classifications = { PL002: "VARIABLE", PL004: "FIXED", PL009: "FIXED", PL015: "VARIABLE" };
  const result = breakEven.calculateClassifiedCostTotals(values, classifications);
  assert.deepEqual(result.value, { fixedCosts: 10, variableCosts: 420 });

  const changed = breakEven.calculateClassifiedCostTotals(values, { ...classifications, PL004: "VARIABLE" });
  assert.deepEqual(changed.value, { fixedCosts: 0, variableCosts: 430 });
});

test("価格Calculatorは1単位売上総利益0以下と数量0を拒否する", () => {
  assert.equal(pricing.calculateRequiredQuantityAfterPriceReduction(4_000, 900, 600).value, 14);
  assert.equal(pricing.calculateRequiredQuantityAfterPriceReduction(4_000, 600, 600).errors[0].code, "NON_POSITIVE_UNIT_GROSS_PROFIT");
  assert.equal(pricing.calculateGrossProfitMaintenancePrice(700, 1_000, 600).value, 1_100);
  const input = { unitCost: 600, salesQuantity: 10, fixedCostsExcludingLabor: 1_000, laborCosts: 500, otherVariableCosts: 500, targetOperatingProfit: 2_000 };
  assert.equal(pricing.calculateRequiredPriceForTargetOperatingProfit(input).value, 1_000);
  assert.equal(pricing.calculateRequiredPriceForTargetOperatingProfit({ ...input, salesQuantity: 0 }).value, null);
});

test("人件費Calculatorは標準率の境界と人数を検証する", () => {
  assert.equal(labor.calculateSocialInsuranceEstimate(1_000, 0.15).value, 150);
  assert.equal(labor.calculateSocialInsuranceEstimate(1_000, 0).value, 0);
  assert.equal(labor.calculateSocialInsuranceEstimate(1_000, 1.1).value, null);
  assert.equal(labor.calculateAdditionalSalary(300, 0).value, 0);
  assert.equal(labor.calculateAdditionalSalary(300, -1).value, null);
  assert.equal(labor.calculateOperatingProfitAfterHiring(500, 0, 0.5, 600).value, -100);
  assert.equal(labor.calculateSocialInsuranceEstimate(103, 0.15).value, 15);
});

test("資金繰りCalculatorは月次値のみ扱い、純流出0以下を数値化しない", () => {
  assert.equal(cash.calculateMonthlyNetCashOutflow(900, 200, 800).value, 300);
  assert.equal(cash.calculateProjectedCashBalance(2_000, 300, 3).value, 1_100);
  const noDecrease = cash.calculateCashRunwayMonths(2_000, 0);
  assert.equal(noDecrease.value, null);
  assert.equal(noDecrease.errors.length, 0);
  assert.equal(noDecrease.warnings.length, 0);
});

test("投資回収Calculatorは回収原資0以下を拒否する", () => {
  assert.equal(investment.calculatePaybackPeriod(2_000, 400).value, 5);
  assert.equal(investment.calculatePaybackPeriod(2_000, 0).value, null);
  assert.equal(investment.calculateReturnOnInvestment(-100, 2_000).value, -0.05);
  assert.equal(investment.calculateRequiredAnnualOperatingProfit(2_000, 4).value, 500);
});

test("財務分析Calculatorは期末残高を受け取り分母0を拒否する", () => {
  assert.equal(financial.calculateReturnOnAssets(10, 100).value, 0.1);
  assert.equal(financial.calculateReturnOnEquity(10, 40).value, 0.25);
  assert.equal(financial.calculateReturnOnAssets(10, 0).value, null);
  assert.equal(financial.calculateWorkingCapital(50, 60).value, -10);
});

test("財務分析Calculatorは負の純資産を許容し0だけを拒否する", () => {
  assert.equal(financial.calculateFixedAssetRatio(100, -20).value, -5);
  assert.equal(financial.calculateDebtRatio(80, -20).value, -4);
  assert.equal(financial.calculateReturnOnEquity(10, -20).value, -0.5);
  assert.equal(financial.calculateReturnOnEquity(10, 0).errors[0].code, "DIVISION_BY_ZERO");
});

test("比較・成長率Calculatorは負値を許容しつつ分母とCAGR条件を検証する", () => {
  assert.equal(comparison.calculateComparisonDifference(-100, -80).value, 20);
  assert.equal(comparison.calculateChangeRate(0, 10).value, null);
  assert.equal(growth.calculateAnnualGrowthRate(-100, -80).value, -0.2);
  assert.ok(Math.abs(growth.calculateCagr(100, 121, 2).value - 0.1) < Number.EPSILON);
  assert.equal(growth.calculateCagr(0, 121, 2).value, null);
});

test("税金Calculatorは税引前当期純利益0以下の法人税等概算を0円にする", () => {
  assert.equal(tax.calculateCorporateTaxEstimate(100, 0.3).value, 30);
  assert.equal(tax.calculateCorporateTaxEstimate(0, 0.3).value, 0);
  assert.equal(tax.calculateCorporateTaxEstimate(-100, 0.3).value, 0);
  assert.equal(tax.calculateCorporateTaxEstimate(100, 1.1).value, null);
  assert.equal(tax.calculateProfitAfterTax(-100, 0).value, -100);
  assert.equal(tax.calculateCorporateTaxEstimate(101, 0.3).value, 30);
});
