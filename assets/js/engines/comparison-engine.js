import * as calculator from "../calculators/comparison.js";
import { validateSameTaxBasis, validateSameUnit } from "../calculators/unit.js";
import { addEngineWarning, appendValidation, createEngineResult, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveContextList, resolveInputs } from "./input-resolver.js";

export function runComparisonEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, { sourceValue: "sourceValue", targetValue: "targetValue", itemValue: "itemValue", totalValue: "totalValue", periods: "periods" });
  recordResolvedValue(result, "sourceValue", input.sourceValue, { validation: { type: "number" } });
  recordResolvedValue(result, "targetValue", input.targetValue, { validation: { type: "number" } });
  recordResolvedValue(result, "periods", input.periods, { validation: { type: "array" } });
  const sourceValue = { ...input.sourceValue, field: "sourceValue", value: result.results.sourceValue, missing: result.results.sourceValue === null };
  const targetValue = { ...input.targetValue, field: "targetValue", value: result.results.targetValue, missing: result.results.targetValue === null };
  recordCalculation(result, "difference", calculator.calculateComparisonDifference(sourceValue.value, targetValue.value), { formula: "targetValue - sourceValue", inputs: { sourceValue, targetValue } });
  recordCalculation(result, "changeRate", calculator.calculateChangeRate(sourceValue.value, targetValue.value), { formula: "(targetValue - sourceValue) ÷ sourceValue", inputs: { sourceValue, targetValue } });
  recordCalculation(result, "compositionRate", calculator.calculateCompositionRate(input.itemValue.value, input.totalValue.value), { formula: "itemValue ÷ totalValue", inputs: { itemValue: input.itemValue, totalValue: input.totalValue } });
  const units = resolveContextList(context, "units", "amountInputUnit");
  const taxBases = resolveContextList(context, "taxBases", "taxAccountingBasis");
  appendValidation(result, "amountInputUnit", validateSameUnit(...units));
  appendValidation(result, "taxAccountingBasis", validateSameTaxBasis(...taxBases));
  if (context.sameMeaning === false) addEngineWarning(result, "comparison", "metric", "MEANING_MISMATCH", "比較対象の意味が一致しません。");
  if (context.samePeriodLength === false) addEngineWarning(result, "comparison", "periods", "PERIOD_LENGTH_MISMATCH", "比較期間の長さが一致しません。");
  return result;
}
