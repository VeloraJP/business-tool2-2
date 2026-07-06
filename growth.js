import * as formula from "../formulas/break-even.js";
import { COST_CLASSIFICATIONS } from "../config/constants.js";
import { roundYen } from "../formulas/common.js";
import { calculateMonetaryNumbers, calculateNumbers, calculateWithValidation, createValidationResult, validateNumber } from "./validation.js";

export const calculateMarginalProfit = (salesAmount, variableCosts) => calculateMonetaryNumbers(formula.marginalProfit, { salesAmount, variableCosts }, { salesAmount: { nonNegative: true }, variableCosts: { nonNegative: true } });
export const calculateMarginalProfitRate = (marginalProfitAmount, salesAmount) => calculateNumbers(formula.marginalProfitRate, { marginalProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateBreakEvenSales = (fixedCosts, marginalProfitRateValue) => calculateMonetaryNumbers(formula.breakEvenSales, { fixedCosts, marginalProfitRateValue }, { fixedCosts: { nonNegative: true }, marginalProfitRateValue: { positive: true } });
export const calculateMarginOfSafetyRate = (salesAmount, breakEvenSalesAmount) => calculateNumbers(formula.marginOfSafetyRate, { salesAmount, breakEvenSalesAmount }, { salesAmount: { positive: true }, breakEvenSalesAmount: { nonNegative: true } });
export const calculateRequiredSalesForTargetOperatingProfit = (fixedCosts, targetOperatingProfit, marginalProfitRateValue) => calculateMonetaryNumbers(formula.requiredSalesForTargetOperatingProfit, { fixedCosts, targetOperatingProfit, marginalProfitRateValue }, { fixedCosts: { nonNegative: true }, marginalProfitRateValue: { positive: true } });
export const calculateScenarioOperatingProfit = (scenarioSalesAmount, marginalProfitRateValue, scenarioFixedCosts) => calculateMonetaryNumbers(formula.scenarioOperatingProfit, { scenarioSalesAmount, marginalProfitRateValue, scenarioFixedCosts }, { scenarioSalesAmount: { nonNegative: true }, marginalProfitRateValue: { rate: true }, scenarioFixedCosts: { nonNegative: true } });

export function calculateClassifiedCostTotals(plValues = {}, classifications = {}) {
  const validation = createValidationResult();
  let fixedCosts = 0;
  let variableCosts = 0;

  for (const [field, classification] of Object.entries(classifications)) {
    if (field === "PL009") continue;
    if (!Object.values(COST_CLASSIFICATIONS).includes(classification)) {
      validation.errors.push({ field, code: "INVALID_COST_CLASSIFICATION", message: `${field}の費用分類が不正です。` });
      continue;
    }
    const value = plValues[field];
    if (!validateNumber(validation, field, value, { nonNegative: true })) continue;
    if (classification === COST_CLASSIFICATIONS.FIXED) fixedCosts += value;
    if (classification === COST_CLASSIFICATIONS.VARIABLE) variableCosts += value;
  }

  return calculateWithValidation(validation, () => ({
    fixedCosts: roundYen(fixedCosts),
    variableCosts: roundYen(variableCosts)
  }));
}
