import * as formula from "../formulas/cash-flow.js";
import { calculateMonetaryNumbers, calculateWithValidation, createValidationResult, validateNumber } from "./validation.js";

export const calculateMonthlyNetCashOutflow = (monthlyCashOut, monthlyLoanPayment, monthlyCashIn) => calculateMonetaryNumbers(formula.monthlyNetCashOutflow, { monthlyCashOut, monthlyLoanPayment, monthlyCashIn }, { monthlyCashOut: { nonNegative: true }, monthlyLoanPayment: { nonNegative: true }, monthlyCashIn: { nonNegative: true } });
export const calculateProjectedCashBalance = (cashBalance, monthlyNetCashOutflowAmount, months) => calculateMonetaryNumbers(formula.projectedCashBalance, { cashBalance, monthlyNetCashOutflowAmount, months }, { cashBalance: { nonNegative: true }, months: { integer: true, nonNegative: true } });
export function calculateCashRunwayMonths(cashBalance, monthlyNetCashOutflowAmount) {
  const validation = createValidationResult();
  validateNumber(validation, "cashBalance", cashBalance, { nonNegative: true });
  validateNumber(validation, "monthlyNetCashOutflowAmount", monthlyNetCashOutflowAmount);
  if (typeof monthlyNetCashOutflowAmount === "number" && monthlyNetCashOutflowAmount <= 0) {
    return { value: null, errors: validation.errors, warnings: validation.warnings, missingFields: validation.missingFields };
  }
  return calculateWithValidation(validation, () => formula.cashRunwayMonths(cashBalance, monthlyNetCashOutflowAmount));
}
