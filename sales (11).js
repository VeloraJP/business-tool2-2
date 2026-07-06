import { difference, ratio } from "./common.js";

export function marginalProfit(salesAmount, variableCosts) {
  return difference(salesAmount, variableCosts);
}

export function marginalProfitRate(marginalProfitAmount, salesAmount) {
  return ratio(marginalProfitAmount, salesAmount);
}

export function breakEvenSales(fixedCosts, marginalProfitRateValue) {
  return ratio(fixedCosts, marginalProfitRateValue);
}

export function marginOfSafetyRate(salesAmount, breakEvenSalesAmount) {
  return ratio(salesAmount - breakEvenSalesAmount, salesAmount);
}

export function requiredSalesForTargetOperatingProfit(
  fixedCosts,
  targetOperatingProfit,
  marginalProfitRateValue
) {
  return ratio(
    fixedCosts + targetOperatingProfit,
    marginalProfitRateValue
  );
}

export function scenarioOperatingProfit(
  scenarioSalesAmount,
  marginalProfitRateValue,
  scenarioFixedCosts
) {
  return scenarioSalesAmount * marginalProfitRateValue - scenarioFixedCosts;
}
