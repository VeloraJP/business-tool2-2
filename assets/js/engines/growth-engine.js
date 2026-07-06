import * as calculator from "../calculators/growth.js";
import { addEngineWarning, createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runGrowthEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, { metric: "metric", previousValue: "previousValue", currentValue: "currentValue", initialValue: "initialValue", finalValue: "finalValue", sourcePeriodEnd: "sourcePeriodEnd", targetPeriodEnd: "targetPeriodEnd", periods: "periods" });
  recordResolvedValue(result, "metric", input.metric, { validation: { type: "string" } });
  recordResolvedValue(result, "periods", input.periods, { validation: { type: "array" } });
  recordCalculation(result, "difference", calculator.calculateGrowthDifference(input.previousValue.value, input.currentValue.value), { formula: "currentValue - previousValue", inputs: { previousValue: input.previousValue, currentValue: input.currentValue } });
  recordCalculation(result, "growthRate", calculator.calculateAnnualGrowthRate(input.previousValue.value, input.currentValue.value), { formula: "(currentValue - previousValue) ÷ previousValue", inputs: { previousValue: input.previousValue, currentValue: input.currentValue } });
  recordCalculation(result, "elapsedYears", calculator.calculateElapsedYearsActAct(input.sourcePeriodEnd.value, input.targetPeriodEnd.value), { formula: "ACT/ACT(sourcePeriodEnd, targetPeriodEnd)", inputs: { sourcePeriodEnd: input.sourcePeriodEnd, targetPeriodEnd: input.targetPeriodEnd }, conditions: ["ACT_ACT", "FEBRUARY_29_TO_MONTH_END"] });
  const elapsedYears = derivedInput(result.results.elapsedYears, "elapsedYears");
  recordCalculation(result, "cagr", calculator.calculateCagr(input.initialValue.value, input.finalValue.value, elapsedYears.value), { formula: "(finalValue ÷ initialValue)^(1 ÷ elapsedYears) - 1", inputs: { initialValue: input.initialValue, finalValue: input.finalValue, elapsedYears }, conditions: ["ACT_ACT"] });
  if (context.periodConsistency === false) addEngineWarning(result, "periods", "periods", "PERIOD_MISMATCH", "対象期間が一致しません。");
  return result;
}
