import { difference, ratio } from "./common.js";

export function equityRatio(netAssets, totalAssets) {
  return ratio(netAssets, totalAssets);
}

export function currentRatio(currentAssets, currentLiabilities) {
  return ratio(currentAssets, currentLiabilities);
}

export function fixedAssetRatio(fixedAssets, netAssets) {
  return ratio(fixedAssets, netAssets);
}

export function debtRatio(totalLiabilities, netAssets) {
  return ratio(totalLiabilities, netAssets);
}

export function returnOnAssets(netProfit, endingTotalAssets) {
  return ratio(netProfit, endingTotalAssets);
}

export function returnOnEquity(netProfit, endingNetAssets) {
  return ratio(netProfit, endingNetAssets);
}

export function operatingProfitMargin(operatingProfit, salesAmount) {
  return ratio(operatingProfit, salesAmount);
}

export function ordinaryProfitMargin(ordinaryProfit, salesAmount) {
  return ratio(ordinaryProfit, salesAmount);
}

export function netProfitMargin(netProfit, salesAmount) {
  return ratio(netProfit, salesAmount);
}

export function totalAssetTurnover(salesAmount, totalAssets) {
  return ratio(salesAmount, totalAssets);
}

export function workingCapital(currentAssets, currentLiabilities) {
  return difference(currentAssets, currentLiabilities);
}

