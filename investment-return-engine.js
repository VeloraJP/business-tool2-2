import * as calculator from "../calculators/break-even.js";
import { STANDARD_COST_CLASSIFICATIONS } from "../data/fixed-variable-costs.js";
import { appendValidation, createEngineResult, derivedInput, recordCalculation } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runBreakEvenEngine(context = {}) {
  const result = createEngineResult();
  const costFields = Object.keys(STANDARD_COST_CLASSIFICATIONS);
  const input = resolveInputs(context, {
    salesAmount: ["salesAmount", "PL001"], variableCosts: "variableCosts", fixedCosts: "fixedCosts",
    targetOperatingProfit: ["targetOperatingProfit", "MG015"],
    scenarioSalesAmount: "scenarioSalesAmount", scenarioFixedCosts: "scenarioFixedCosts",
    ...Object.fromEntries(costFields.map((field) => [field, field]))
  });
  const classifications = { ...STANDARD_COST_CLASSIFICATIONS, ...(context.costClassifications ?? {}) };
  const needsAggregation = input.variableCosts.missing || input.fixedCosts.missing;
  const classifiedCosts = needsAggregation
    ? calculator.calculateClassifiedCostTotals(
      Object.fromEntries(costFields.map((field) => [field, input[field].value])),
      classifications
    )
    : { value: null, errors: [], warnings: [], missingFields: [] };
  if (needsAggregation) appendValidation(result, "costClassifications", classifiedCosts);
  const classificationSource = context.costClassifications ? "SCREEN_MANUAL" : "STANDARD_CLASSIFICATION";
  const aggregateInput = (name) => ({
    field: name,
    value: classifiedCosts.value?.[name] ?? null,
    missing: classifiedCosts.value === null,
    source: { type: "DERIVED_SOURCE", field: name, detail: { type: "COST_CLASSIFICATION_AGGREGATION", classificationSource } }
  });
  const variableCosts = input.variableCosts.missing ? aggregateInput("variableCosts") : input.variableCosts;
  const fixedCosts = input.fixedCosts.missing ? aggregateInput("fixedCosts") : input.fixedCosts;
  recordCalculation(result, "marginalProfit", calculator.calculateMarginalProfit(input.salesAmount.value, variableCosts.value), { formula: "salesAmount - variableCosts", rounding: "ROUND_YEN", inputs: { salesAmount: input.salesAmount, variableCosts } });
  const marginal = derivedInput(result.results.marginalProfit, "marginalProfit");
  recordCalculation(result, "marginalProfitRate", calculator.calculateMarginalProfitRate(marginal.value, input.salesAmount.value), { formula: "marginalProfit ÷ salesAmount", inputs: { marginalProfit: marginal, salesAmount: input.salesAmount } });
  const rate = derivedInput(result.results.marginalProfitRate, "marginalProfitRate");
  recordCalculation(result, "breakEvenSales", calculator.calculateBreakEvenSales(fixedCosts.value, rate.value), { formula: "fixedCosts ÷ marginalProfitRate", rounding: "ROUND_YEN", inputs: { fixedCosts, marginalProfitRate: rate } });
  const breakEven = derivedInput(result.results.breakEvenSales, "breakEvenSales");
  recordCalculation(result, "marginOfSafetyRate", calculator.calculateMarginOfSafetyRate(input.salesAmount.value, breakEven.value), { formula: "(salesAmount - breakEvenSales) ÷ salesAmount", inputs: { salesAmount: input.salesAmount, breakEvenSales: breakEven } });
  recordCalculation(result, "requiredSalesForTargetOperatingProfit", calculator.calculateRequiredSalesForTargetOperatingProfit(fixedCosts.value, input.targetOperatingProfit.value, rate.value), { formula: "(fixedCosts + targetOperatingProfit) ÷ marginalProfitRate", rounding: "ROUND_YEN", inputs: { fixedCosts, targetOperatingProfit: input.targetOperatingProfit, marginalProfitRate: rate } });
  recordCalculation(result, "scenarioOperatingProfit", calculator.calculateScenarioOperatingProfit(input.scenarioSalesAmount.value, rate.value, input.scenarioFixedCosts.value), { formula: "scenarioSalesAmount × marginalProfitRate - scenarioFixedCosts", rounding: "ROUND_YEN", inputs: { scenarioSalesAmount: input.scenarioSalesAmount, marginalProfitRate: rate, scenarioFixedCosts: input.scenarioFixedCosts }, conditions: ["CONSTANT_MARGINAL_PROFIT_RATE"] });
  result.calculationBasis.costClassifications = { formula: "STANDARD_OR_MANUAL_CLASSIFICATION", rounding: "NONE", conditions: ["PL009_EXCLUDED"] };
  result.usedInputs.costClassifications = classifications;
  result.inputSources.costClassifications = { type: classificationSource };
  if (needsAggregation) {
    result.usedInputs.costAggregation = Object.fromEntries(costFields.map((field) => [field, input[field].value]));
    result.inputSources.costAggregation = Object.fromEntries(costFields.map((field) => [field, input[field].source]));
  }
  return result;
}
