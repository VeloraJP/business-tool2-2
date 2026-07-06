import * as formula from "../formulas/growth.js";
import { calculateNumbers, calculateWithValidation, createValidationResult, isMissing } from "./validation.js";

export const calculateGrowthDifference = (previousValue, currentValue) => calculateNumbers(formula.growthDifference, { previousValue, currentValue });
export const calculateAnnualGrowthRate = (previousValue, currentValue) => calculateNumbers(formula.annualGrowthRate, { previousValue, currentValue }, { previousValue: { nonZero: true } });
export const calculateCagr = (initialValue, finalValue, years) => calculateNumbers(formula.cagr, { initialValue, finalValue, years }, { initialValue: { positive: true }, finalValue: { nonNegative: true }, years: { positive: true } });

function parsePeriodEnd(validation, field, value) {
  if (isMissing(value)) {
    validation.missingFields.push({ field, code: "REQUIRED", message: `${field}は必須です。` });
    return null;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    validation.errors.push({ field, code: "INVALID_DATE", message: `${field}はYYYY-MM-DD形式で入力してください。` });
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    validation.errors.push({ field, code: "INVALID_DATE", message: `${field}に存在する日付を入力してください。` });
    return null;
  }
  return date;
}

export function calculateElapsedYearsActAct(sourcePeriodEnd, targetPeriodEnd) {
  const validation = createValidationResult();
  const source = parsePeriodEnd(validation, "sourcePeriodEnd", sourcePeriodEnd);
  const target = parsePeriodEnd(validation, "targetPeriodEnd", targetPeriodEnd);
  if (source && target && target <= source) {
    validation.errors.push({ field: "targetPeriodEnd", code: "INVALID_PERIOD_ORDER", message: "比較先期末日は比較元期末日より後にしてください。" });
  }
  return calculateWithValidation(validation, () => formula.elapsedYearsActAct(sourcePeriodEnd, targetPeriodEnd));
}
