import * as formula from "../formulas/profit.js";
import { roundYen } from "../formulas/common.js";
import { calculateMonetaryNumbers, calculateNumbers, calculateWithValidation, createValidationResult, validateNumber } from "./validation.js";

export const calculateGrossProfit = (salesAmount, costOfSales) => calculateMonetaryNumbers(formula.grossProfit, { salesAmount, costOfSales }, { salesAmount: { nonNegative: true }, costOfSales: { nonNegative: true } });
export const calculateLaborCostTotal = (executiveCompensation, salaries, statutoryBenefits) => calculateMonetaryNumbers(formula.laborCostTotal, { executiveCompensation, salaries, statutoryBenefits }, { executiveCompensation: { nonNegative: true }, salaries: { nonNegative: true }, statutoryBenefits: { nonNegative: true } });
export function calculateSellingGeneralAndAdministrativeExpenses(values) {
  const validation = createValidationResult();
  Object.entries(values).forEach(([field, value]) => validateNumber(validation, field, value, { nonNegative: true }));
  return calculateWithValidation(validation, () => roundYen(formula.sellingGeneralAndAdministrativeExpenses(values)));
}
export const calculateOperatingProfit = (grossProfitAmount, sgAndAAmount) => calculateMonetaryNumbers(formula.operatingProfit, { grossProfitAmount, sgAndAAmount }, { sgAndAAmount: { nonNegative: true } });
export const calculateOrdinaryProfit = (operatingProfitAmount, nonOperatingIncome, nonOperatingExpenses) => calculateMonetaryNumbers(formula.ordinaryProfit, { operatingProfitAmount, nonOperatingIncome, nonOperatingExpenses }, { nonOperatingIncome: { nonNegative: true }, nonOperatingExpenses: { nonNegative: true } });
export const calculateIncomeBeforeTax = (ordinaryProfitAmount, extraordinaryIncome, extraordinaryLoss) => calculateMonetaryNumbers(formula.incomeBeforeTax, { ordinaryProfitAmount, extraordinaryIncome, extraordinaryLoss }, { extraordinaryIncome: { nonNegative: true }, extraordinaryLoss: { nonNegative: true } });
export const calculateNetProfit = (incomeBeforeTaxAmount, corporateTax) => calculateMonetaryNumbers(formula.netProfit, { incomeBeforeTaxAmount, corporateTax }, { corporateTax: { nonNegative: true } });
export const calculateGrossProfitRate = (grossProfitAmount, salesAmount) => calculateNumbers(formula.grossProfitRate, { grossProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateOperatingProfitRate = (operatingProfitAmount, salesAmount) => calculateNumbers(formula.operatingProfitRate, { operatingProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateOrdinaryProfitRate = (ordinaryProfitAmount, salesAmount) => calculateNumbers(formula.ordinaryProfitRate, { ordinaryProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateNetProfitRate = (netProfitAmount, salesAmount) => calculateNumbers(formula.netProfitRate, { netProfitAmount, salesAmount }, { salesAmount: { positive: true } });
