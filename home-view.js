import { difference, ratio, sum } from "./common.js";

export function grossProfit(salesAmount, costOfSales) {
  return difference(salesAmount, costOfSales);
}

export function laborCostTotal(executiveCompensation, salaries, statutoryBenefits) {
  return sum([executiveCompensation, salaries, statutoryBenefits]);
}

export function sellingGeneralAndAdministrativeExpenses({
  laborCost,
  rent,
  utilities,
  advertising,
  fees,
  depreciation,
  otherFixedCosts,
  otherVariableCosts
}) {
  return sum([
    laborCost,
    rent,
    utilities,
    advertising,
    fees,
    depreciation,
    otherFixedCosts,
    otherVariableCosts
  ]);
}

export function operatingProfit(grossProfitAmount, sgAndAAmount) {
  return difference(grossProfitAmount, sgAndAAmount);
}

export function ordinaryProfit(
  operatingProfitAmount,
  nonOperatingIncome,
  nonOperatingExpenses
) {
  return operatingProfitAmount + nonOperatingIncome - nonOperatingExpenses;
}

export function incomeBeforeTax(
  ordinaryProfitAmount,
  extraordinaryIncome,
  extraordinaryLoss
) {
  return ordinaryProfitAmount + extraordinaryIncome - extraordinaryLoss;
}

export function netProfit(incomeBeforeTaxAmount, corporateTax) {
  return difference(incomeBeforeTaxAmount, corporateTax);
}

export const grossProfitRate = (grossProfitAmount, salesAmount) =>
  ratio(grossProfitAmount, salesAmount);

export const operatingProfitRate = (operatingProfitAmount, salesAmount) =>
  ratio(operatingProfitAmount, salesAmount);

export const ordinaryProfitRate = (ordinaryProfitAmount, salesAmount) =>
  ratio(ordinaryProfitAmount, salesAmount);

export const netProfitRate = (netProfitAmount, salesAmount) =>
  ratio(netProfitAmount, salesAmount);
