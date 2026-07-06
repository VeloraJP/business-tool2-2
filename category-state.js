import { difference, ratio } from "./common.js";

export function comparisonDifference(sourceValue, targetValue) {
  return difference(targetValue, sourceValue);
}

export function changeRate(sourceValue, targetValue) {
  return ratio(targetValue - sourceValue, sourceValue);
}

export function compositionRate(itemValue, totalValue) {
  return ratio(itemValue, totalValue);
}

