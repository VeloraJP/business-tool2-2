import * as formula from "../formulas/tax.js";
import { calculateMonetaryNumbers } from "./validation.js";

export const calculateCorporateTaxEstimate = (incomeBeforeTax, effectiveTaxRate) => calculateMonetaryNumbers(formula.corporateTaxEstimate, { incomeBeforeTax, effectiveTaxRate }, { effectiveTaxRate: { rate: true } });
export const calculateProfitAfterTax = (incomeBeforeTax, corporateTaxEstimateAmount) => calculateMonetaryNumbers(formula.profitAfterTax, { incomeBeforeTax, corporateTaxEstimateAmount }, { corporateTaxEstimateAmount: { nonNegative: true } });
