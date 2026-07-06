import * as formula from "../formulas/comparison.js";
import { calculateNumbers } from "./validation.js";

export const calculateComparisonDifference = (sourceValue, targetValue) => calculateNumbers(formula.comparisonDifference, { sourceValue, targetValue });
export const calculateChangeRate = (sourceValue, targetValue) => calculateNumbers(formula.changeRate, { sourceValue, targetValue }, { sourceValue: { nonZero: true } });
export const calculateCompositionRate = (itemValue, totalValue) => calculateNumbers(formula.compositionRate, { itemValue, totalValue }, { itemValue: { nonNegative: true }, totalValue: { positive: true } });
