import { difference, ratio } from "./common.js";

export function operatingProfitAfterRunningCost(
  annualOperatingProfitAfterInvestment,
  annualRunningCost
) {
  return difference(
    annualOperatingProfitAfterInvestment,
    annualRunningCost
  );
}

export function paybackPeriod(
  investmentAmount,
  annualIncrementalCashFlow
) {
  return ratio(investmentAmount, annualIncrementalCashFlow);
}

export function returnOnInvestment(
  annualIncrementalOperatingProfit,
  investmentAmount
) {
  return ratio(annualIncrementalOperatingProfit, investmentAmount);
}

export function incrementalOperatingProfit(
  annualOperatingProfitAfterInvestment,
  annualOperatingProfitBeforeInvestment,
  annualRunningCost
) {
  return annualOperatingProfitAfterInvestment -
    annualOperatingProfitBeforeInvestment -
    annualRunningCost;
}

export function requiredAnnualOperatingProfit(
  investmentAmount,
  targetPaybackYears
) {
  return ratio(investmentAmount, targetPaybackYears);
}
