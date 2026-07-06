import * as calculator from "../calculators/tax.js";
import { STANDARD_EFFECTIVE_TAX_RATE, STANDARD_RATE_BASE_DATE } from "../config/constants.js";
import { createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runTaxEngine(context = {}) {
  const derivedContext = { ...context, derived: { effectiveTaxRate: STANDARD_EFFECTIVE_TAX_RATE, rateBaseDate: STANDARD_RATE_BASE_DATE, ...(context.derived ?? {}) } };
  const result = createEngineResult();
  const input = resolveInputs(derivedContext, { incomeBeforeTax: ["incomeBeforeTax", "PL023"], effectiveTaxRate: "effectiveTaxRate", rateBaseDate: "rateBaseDate" });
  recordResolvedValue(result, "incomeBeforeTax", input.incomeBeforeTax, { rounding: "ROUND_YEN" });
  recordResolvedValue(result, "effectiveTaxRate", input.effectiveTaxRate, { validation: { type: "rate" } });
  const incomeBeforeTax = derivedInput(result.results.incomeBeforeTax, "incomeBeforeTax");
  const effectiveTaxRate = derivedInput(result.results.effectiveTaxRate, "effectiveTaxRate");
  recordCalculation(result, "corporateTaxEstimate", calculator.calculateCorporateTaxEstimate(incomeBeforeTax.value, effectiveTaxRate.value), { formula: "max(incomeBeforeTax, 0) × effectiveTaxRate", rounding: "ROUND_YEN", inputs: { incomeBeforeTax, effectiveTaxRate, rateBaseDate: input.rateBaseDate }, conditions: ["ESTIMATE", "ZERO_WHEN_INCOME_BEFORE_TAX_LE_ZERO"] });
  const tax = derivedInput(result.results.corporateTaxEstimate, "corporateTaxEstimate");
  recordCalculation(result, "profitAfterTax", calculator.calculateProfitAfterTax(incomeBeforeTax.value, tax.value), { formula: "incomeBeforeTax - corporateTaxEstimate", rounding: "ROUND_YEN", inputs: { incomeBeforeTax, corporateTaxEstimate: tax } });
  return result;
}
