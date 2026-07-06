import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS } from "../../assets/js/config/constants.js";
import * as common from "../../assets/js/formulas/common.js";
import * as sales from "../../assets/js/formulas/sales.js";
import * as profit from "../../assets/js/formulas/profit.js";
import * as breakEven from "../../assets/js/formulas/break-even.js";
import * as pricing from "../../assets/js/formulas/pricing.js";
import * as labor from "../../assets/js/formulas/labor-cost.js";
import * as cash from "../../assets/js/formulas/cash-flow.js";
import * as investment from "../../assets/js/formulas/investment-return.js";
import * as financial from "../../assets/js/formulas/financial-analysis.js";
import * as comparison from "../../assets/js/formulas/comparison.js";
import * as growth from "../../assets/js/formulas/growth.js";
import * as tax from "../../assets/js/formulas/tax.js";

test("共通Formulaは合計・差・比率・平均・成長率を計算する", () => {
  assert.equal(common.sum([1, 2, 3]), 6);
  assert.equal(common.difference(8, 3), 5);
  assert.equal(common.ratio(1, 4), 0.25);
  assert.equal(common.average([2, 4, 6]), 4);
  assert.equal(common.growthRate(120, 100), 0.2);
  assert.ok(Math.abs(common.compoundAnnualGrowthRate(100, 121, 2) - 0.1) < Number.EPSILON);
});

test("円換算・四捨五入・必要数量切上げを仕様どおり処理する", () => {
  assert.equal(common.convertAmountToYen(2, AMOUNT_INPUT_UNITS.YEN), 2);
  assert.equal(common.convertAmountToYen(2, AMOUNT_INPUT_UNITS.THOUSAND_YEN), 2_000);
  assert.equal(common.convertAmountToYen(2, AMOUNT_INPUT_UNITS.TEN_THOUSAND_YEN), 20_000);
  assert.equal(common.roundYen(10.49), 10);
  assert.equal(common.roundYen(10.5), 11);
  assert.equal(common.roundYen(-10.5), -11);
  assert.equal(common.roundMonthlyPayment(100.5), 101);
  assert.equal(common.ceilRequiredQuantity(2.01), 3);
});

test("売上Formulaは必要客数・数量だけを切り上げる", () => {
  assert.equal(sales.salesAmountFromCustomers(2_000, 10), 20_000);
  assert.equal(sales.salesAmountFromQuantity(500, 8), 4_000);
  assert.equal(sales.customerUnitPrice(10_000, 4), 2_500);
  assert.equal(sales.requiredCustomerCount(10_001, 2_000), 6);
  assert.equal(sales.requiredSalesQuantity(10_001, 2_000), 6);
  assert.equal(sales.dailySales(30_000, 30), 1_000);
  assert.equal(sales.salesPerEmployee(30_000, 3), 10_000);
});

test("損益FormulaはPL009を販管費へ二重加算しない", () => {
  const laborCost = profit.laborCostTotal(10, 20, 5);
  const sgAndA = profit.sellingGeneralAndAdministrativeExpenses({ laborCost, rent: 10, utilities: 5, advertising: 2, fees: 1, depreciation: 3, otherFixedCosts: 4, otherVariableCosts: 5 });
  assert.equal(laborCost, 35);
  assert.equal(sgAndA, 65);
  assert.equal(profit.grossProfit(200, 80), 120);
  assert.equal(profit.operatingProfit(120, sgAndA), 55);
  assert.equal(profit.ordinaryProfit(55, 4, 2), 57);
  assert.equal(profit.incomeBeforeTax(57, 3, 1), 59);
  assert.equal(profit.netProfit(59, 18), 41);
  assert.equal(profit.grossProfitRate(20, 100), 0.2);
  assert.equal(profit.operatingProfitRate(20, 100), 0.2);
  assert.equal(profit.ordinaryProfitRate(20, 100), 0.2);
  assert.equal(profit.netProfitRate(20, 100), 0.2);
});

test("損益分岐点Formulaを計算する", () => {
  assert.equal(breakEven.marginalProfit(1_000, 400), 600);
  assert.equal(breakEven.marginalProfitRate(600, 1_000), 0.6);
  assert.equal(breakEven.breakEvenSales(300, 0.6), 500);
  assert.equal(breakEven.marginOfSafetyRate(1_000, 500), 0.5);
  assert.equal(breakEven.requiredSalesForTargetOperatingProfit(300, 120, 0.6), 700);
});

test("価格Formulaは1単位原価と必要数量切上げを扱う", () => {
  assert.equal(pricing.currentGrossProfit(1_000, 600, 10), 4_000);
  assert.equal(pricing.grossProfitAfterPriceChange(900, 600, 10), 3_000);
  assert.equal(pricing.requiredQuantityAfterPriceReduction(4_000, 900, 600), 14);
  assert.equal(pricing.grossProfitMaintenancePrice(700, 1_000, 600), 1_100);
  assert.equal(pricing.requiredPriceForTargetOperatingProfit({ unitCost: 600, salesQuantity: 10, fixedCostsExcludingLabor: 1_000, laborCosts: 500, otherVariableCosts: 500, targetOperatingProfit: 2_000 }), 1_000);
});

test("人件費・資金繰り・投資回収Formulaを計算する", () => {
  assert.equal(labor.laborCostTotal(10, 20, 5), 35);
  assert.equal(labor.laborCostRate(20, 100), 0.2);
  assert.equal(labor.additionalSalary(300, 2), 600);
  assert.equal(labor.socialInsuranceEstimate(600, 0.15), 90);
  assert.equal(labor.additionalLaborCost(600, 90), 690);
  assert.equal(labor.laborCostAfterHiring(1_000, 690), 1_690);
  assert.equal(labor.operatingProfitAfterHiring(800, 0, 0.5, 690), 110);
  assert.equal(labor.requiredAdditionalSales(690, 0.5), 1_380);
  assert.equal(labor.salesPerEmployee(10_000, 5), 2_000);
  assert.equal(cash.monthlyNetCashOutflow(900, 200, 800), 300);
  assert.equal(cash.projectedCashBalance(2_000, 300, 3), 1_100);
  assert.equal(cash.cashRunwayMonths(2_000, 300), 20 / 3);
  assert.equal(investment.operatingProfitAfterRunningCost(500, 100), 400);
  assert.equal(investment.paybackPeriod(2_000, 400), 5);
  assert.equal(investment.returnOnInvestment(400, 2_000), 0.2);
  assert.equal(investment.requiredAnnualOperatingProfit(2_000, 4), 500);
});

test("財務分析11指標は期末残高方式で計算する", () => {
  assert.equal(financial.equityRatio(40, 100), 0.4);
  assert.equal(financial.currentRatio(80, 40), 2);
  assert.equal(financial.fixedAssetRatio(60, 40), 1.5);
  assert.equal(financial.debtRatio(60, 40), 1.5);
  assert.equal(financial.returnOnAssets(10, 100), 0.1);
  assert.equal(financial.returnOnEquity(10, 40), 0.25);
  assert.equal(financial.operatingProfitMargin(12, 100), 0.12);
  assert.equal(financial.ordinaryProfitMargin(11, 100), 0.11);
  assert.equal(financial.netProfitMargin(8, 100), 0.08);
  assert.equal(financial.totalAssetTurnover(150, 100), 1.5);
  assert.equal(financial.workingCapital(80, 40), 40);
});

test("比較・成長率・税金Formulaを境界値込みで計算する", () => {
  assert.equal(comparison.comparisonDifference(100, 120), 20);
  assert.equal(comparison.changeRate(100, 120), 0.2);
  assert.equal(comparison.compositionRate(30, 100), 0.3);
  assert.equal(growth.growthDifference(100, 120), 20);
  assert.equal(growth.annualGrowthRate(100, 120), 0.2);
  assert.ok(Math.abs(growth.cagr(100, 121, 2) - 0.1) < Number.EPSILON);
  assert.equal(tax.corporateTaxEstimate(100, 0.3), 30);
  assert.equal(tax.corporateTaxEstimate(0, 0.3), 0);
  assert.equal(tax.corporateTaxEstimate(-100, 0.3), 0);
  assert.equal(tax.profitAfterTax(100, 30), 70);
});
