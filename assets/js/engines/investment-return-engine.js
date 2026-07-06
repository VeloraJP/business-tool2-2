import * as calculator from "../calculators/investment-return.js";
import { createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runInvestmentReturnEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    investmentAmount: "investmentAmount", annualOperatingProfitBeforeInvestment: "annualOperatingProfitBeforeInvestment",
    annualOperatingProfitAfterInvestment: "annualOperatingProfitAfterInvestment", annualIncrementalCashFlow: "annualIncrementalCashFlow", annualRunningCost: "annualRunningCost",
    targetPaybackYears: "targetPaybackYears"
  });
  recordResolvedValue(result, "investmentAmount", input.investmentAmount, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  const investmentAmount = derivedInput(result.results.investmentAmount, "investmentAmount");
  recordCalculation(result, "operatingProfitAfterRunningCost", calculator.calculateOperatingProfitAfterRunningCost(input.annualOperatingProfitAfterInvestment.value, input.annualRunningCost.value), { formula: "annualOperatingProfitAfterInvestment - annualRunningCost", rounding: "ROUND_YEN", inputs: { annualOperatingProfitAfterInvestment: input.annualOperatingProfitAfterInvestment, annualRunningCost: input.annualRunningCost } });
  recordResolvedValue(result, "annualIncrementalCashFlow", input.annualIncrementalCashFlow, { rounding: "ROUND_YEN", validation: { type: "number" } });
  const incrementalCashFlow = derivedInput(result.results.annualIncrementalCashFlow, "annualIncrementalCashFlow");
  recordCalculation(result, "annualIncrementalOperatingProfit", calculator.calculateIncrementalOperatingProfit(input.annualOperatingProfitAfterInvestment.value, input.annualOperatingProfitBeforeInvestment.value, input.annualRunningCost.value), { formula: "annualOperatingProfitAfterInvestment - annualOperatingProfitBeforeInvestment - annualRunningCost", rounding: "ROUND_YEN", inputs: { annualOperatingProfitAfterInvestment: input.annualOperatingProfitAfterInvestment, annualOperatingProfitBeforeInvestment: input.annualOperatingProfitBeforeInvestment, annualRunningCost: input.annualRunningCost } });
  const incrementalOperatingProfit = derivedInput(result.results.annualIncrementalOperatingProfit, "annualIncrementalOperatingProfit");
  recordCalculation(result, "paybackPeriod", calculator.calculatePaybackPeriod(investmentAmount.value, incrementalCashFlow.value), { formula: "investmentAmount ÷ annualIncrementalCashFlow", inputs: { investmentAmount, annualIncrementalCashFlow: incrementalCashFlow }, conditions: ["CONSTANT_ANNUAL_INCREMENTAL_CASH_FLOW", "UNDISCOUNTED"] });
  recordCalculation(result, "roi", calculator.calculateReturnOnInvestment(incrementalOperatingProfit.value, investmentAmount.value), { formula: "annualIncrementalOperatingProfit ÷ investmentAmount", inputs: { annualIncrementalOperatingProfit: incrementalOperatingProfit, investmentAmount }, conditions: ["PRE_TAX_OPERATING_PROFIT"] });
  recordCalculation(result, "requiredAnnualOperatingProfit", calculator.calculateRequiredAnnualOperatingProfit(investmentAmount.value, input.targetPaybackYears.value), { formula: "investmentAmount ÷ targetPaybackYears", rounding: "ROUND_YEN", inputs: { investmentAmount, targetPaybackYears: input.targetPaybackYears } });
  return result;
}
