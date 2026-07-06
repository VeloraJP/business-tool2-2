import * as calculator from "../calculators/labor-cost.js";
import { STANDARD_RATE_BASE_DATE, STANDARD_SOCIAL_INSURANCE_RATE } from "../config/constants.js";
import { addEngineWarning, createEngineResult, derivedInput, recordCalculation } from "./contract.js";
import { INPUT_SOURCE_TYPES, resolveInputs } from "./input-resolver.js";

export function runLaborCostEngine(context = {}) {
  const derivedContext = { ...context, derived: { socialInsuranceRate: STANDARD_SOCIAL_INSURANCE_RATE, rateBaseDate: STANDARD_RATE_BASE_DATE, ...(context.derived ?? {}) } };
  const result = createEngineResult();
  const input = resolveInputs(derivedContext, {
    executiveCompensation: ["executiveCompensation", "PL004"], salaries: ["salaries", "PL005"], statutoryBenefits: ["statutoryBenefits", "PL006"],
    salesAmount: ["salesAmount", "PL001"], currentLaborCosts: ["currentLaborCosts", "laborCostTotal", "PL007"], currentOperatingProfit: ["currentOperatingProfit", "PL017"],
    expectedSalaryPerPerson: "expectedSalaryPerPerson", plannedHireCount: "plannedHireCount", socialInsuranceRate: "socialInsuranceRate",
    marginalProfitRate: "marginalProfitRate", expectedAdditionalSales: "expectedAdditionalSales",
    employeeCount: ["employeeCount", "MG001"], rateBaseDate: "rateBaseDate"
  });
  recordCalculation(result, "laborCostTotal", calculator.calculateLaborCostTotal(input.executiveCompensation.value, input.salaries.value, input.statutoryBenefits.value), { formula: "executiveCompensation + salaries + statutoryBenefits", rounding: "ROUND_YEN", inputs: { executiveCompensation: input.executiveCompensation, salaries: input.salaries, statutoryBenefits: input.statutoryBenefits } });
  const laborTotal = input.currentLaborCosts.missing ? derivedInput(result.results.laborCostTotal, "laborCostTotal") : input.currentLaborCosts;
  recordCalculation(result, "laborCostRate", calculator.calculateLaborCostRate(laborTotal.value, input.salesAmount.value), { formula: "laborCostTotal ÷ salesAmount", inputs: { laborCostTotal: laborTotal, salesAmount: input.salesAmount } });
  recordCalculation(result, "additionalSalary", calculator.calculateAdditionalSalary(input.expectedSalaryPerPerson.value, input.plannedHireCount.value), { formula: "expectedSalaryPerPerson × plannedHireCount", rounding: "ROUND_YEN", inputs: { expectedSalaryPerPerson: input.expectedSalaryPerPerson, plannedHireCount: input.plannedHireCount } });
  const additionalSalary = derivedInput(result.results.additionalSalary, "additionalSalary");
  recordCalculation(result, "socialInsuranceEstimate", calculator.calculateSocialInsuranceEstimate(additionalSalary.value, input.socialInsuranceRate.value), { formula: "additionalSalary × socialInsuranceRate", rounding: "ROUND_YEN", inputs: { additionalSalary, socialInsuranceRate: input.socialInsuranceRate, rateBaseDate: input.rateBaseDate }, conditions: ["ESTIMATE"] });
  const insurance = derivedInput(result.results.socialInsuranceEstimate, "socialInsuranceEstimate");
  recordCalculation(result, "additionalLaborCost", calculator.calculateAdditionalLaborCost(additionalSalary.value, insurance.value), { formula: "additionalSalary + socialInsuranceEstimate", rounding: "ROUND_YEN", inputs: { additionalSalary, socialInsuranceEstimate: insurance } });
  const additional = derivedInput(result.results.additionalLaborCost, "additionalLaborCost");
  recordCalculation(result, "laborCostAfterHiring", calculator.calculateLaborCostAfterHiring(laborTotal.value, additional.value), { formula: "currentLaborCosts + additionalLaborCost", rounding: "ROUND_YEN", inputs: { currentLaborCosts: laborTotal, additionalLaborCost: additional } });
  recordCalculation(result, "operatingProfitAfterHiring", calculator.calculateOperatingProfitAfterHiring(input.currentOperatingProfit.value, input.expectedAdditionalSales.value, input.marginalProfitRate.value, additional.value), { formula: "currentOperatingProfit + expectedAdditionalSales × marginalProfitRate - additionalLaborCost", rounding: "ROUND_YEN", inputs: { currentOperatingProfit: input.currentOperatingProfit, expectedAdditionalSales: input.expectedAdditionalSales, marginalProfitRate: input.marginalProfitRate, additionalLaborCost: additional }, conditions: ["CONSTANT_MARGINAL_PROFIT_RATE"] });
  recordCalculation(result, "requiredAdditionalSales", calculator.calculateRequiredAdditionalSales(additional.value, input.marginalProfitRate.value), { formula: "additionalLaborCost ÷ marginalProfitRate", rounding: "ROUND_YEN", inputs: { additionalLaborCost: additional, marginalProfitRate: input.marginalProfitRate } });
  recordCalculation(result, "salesPerEmployee", calculator.calculateSalesPerEmployee(input.salesAmount.value, input.employeeCount.value), { formula: "salesAmount ÷ employeeCount", rounding: "ROUND_YEN", inputs: { salesAmount: input.salesAmount, employeeCount: input.employeeCount } });
  if (input.currentLaborCosts.source?.type === INPUT_SOURCE_TYPES.SAVED_AUTO) {
    const expected = calculator.calculateLaborCostTotal(input.executiveCompensation.value, input.salaries.value, input.statutoryBenefits.value);
    if (expected.value !== null && expected.value !== input.currentLaborCosts.value) {
      addEngineWarning(result, "laborCostTotal", input.currentLaborCosts.field, "LABOR_DETAIL_MISMATCH", "人件費合計と内訳が一致しません。");
    }
  }
  return result;
}
