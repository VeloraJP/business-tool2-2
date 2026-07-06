import { LOAN_REPAYMENT_METHODS } from "../config/constants.js";
import * as formula from "../formulas/loan-repayment.js";
import { calculateMonetaryNumbers, calculateNumbers, calculateWithValidation, createValidationResult, isMissing, validateNumber, validateRate } from "./validation.js";

export const calculateMonthlyInterestRate = (annualInterestRate) => calculateNumbers(formula.monthlyInterestRate, { annualInterestRate }, { annualInterestRate: { rate: true } });
export const calculateEqualPaymentAmount = (loanAmount, annualInterestRate, months) => calculateMonetaryNumbers(formula.equalPaymentAmount, { loanAmount, annualInterestRate, months }, { loanAmount: { nonNegative: true }, annualInterestRate: { rate: true }, months: { integer: true, positive: true } });
export function calculateRepaymentSchedule(loanAmount, annualInterestRate, months, method) {
  const validation = createValidationResult();
  validateNumber(validation, "loanAmount", loanAmount, { nonNegative: true });
  validateRate(validation, "annualInterestRate", annualInterestRate);
  validateNumber(validation, "months", months, { integer: true, positive: true });
  if (isMissing(method)) validation.missingFields.push({ field: "method", code: "REQUIRED", message: "methodは必須です。" });
  else if (!Object.values(LOAN_REPAYMENT_METHODS).includes(method)) validation.errors.push({ field: "method", code: "INVALID_VALUE", message: "返済方式が不正です。" });
  return calculateWithValidation(validation, () => method === LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT ? formula.equalPaymentSchedule(loanAmount, annualInterestRate, months) : formula.equalPrincipalSchedule(loanAmount, annualInterestRate, months));
}
export const calculateAnnualPayment = (schedule, startMonthIndex = 0) => {
  const validation = createValidationResult();
  if (!Array.isArray(schedule)) validation.errors.push({ field: "schedule", code: "INVALID_ARRAY", message: "scheduleは配列で指定してください。" });
  validateNumber(validation, "startMonthIndex", startMonthIndex, { integer: true, nonNegative: true });
  return calculateWithValidation(validation, () => formula.annualPayment(schedule, startMonthIndex));
};
export const calculateTotalPayment = (schedule) => Array.isArray(schedule) ? { value: formula.totalPayment(schedule), errors: [], warnings: [], missingFields: [] } : { value: null, errors: [{ field: "schedule", code: "INVALID_ARRAY", message: "scheduleは配列で指定してください。" }], warnings: [], missingFields: [] };
export const calculateTotalInterest = (schedule) => Array.isArray(schedule) ? { value: formula.totalInterest(schedule), errors: [], warnings: [], missingFields: [] } : { value: null, errors: [{ field: "schedule", code: "INVALID_ARRAY", message: "scheduleは配列で指定してください。" }], warnings: [], missingFields: [] };
export const calculateDscr = (annualPreDebtServiceCashFlow, annualPaymentAmount) => calculateNumbers(formula.dscr, { annualPreDebtServiceCashFlow, annualPaymentAmount }, { annualPaymentAmount: { positive: true } });
export const calculateTotalInterestBearingDebt = (shortTermBorrowings, longTermBorrowings) => calculateMonetaryNumbers(formula.totalInterestBearingDebt, { shortTermBorrowings, longTermBorrowings }, { shortTermBorrowings: { nonNegative: true }, longTermBorrowings: { nonNegative: true } });
export const calculateSimpleRepaymentCashFlow = (operatingProfit, depreciation) => calculateMonetaryNumbers(formula.simpleRepaymentCashFlow, { operatingProfit, depreciation }, { depreciation: { nonNegative: true } });
export const calculateDebtRepaymentYears = (totalInterestBearingDebtAmount, simpleRepaymentCashFlowAmount) => calculateNumbers(formula.debtRepaymentYears, { totalInterestBearingDebtAmount, simpleRepaymentCashFlowAmount }, { totalInterestBearingDebtAmount: { nonNegative: true }, simpleRepaymentCashFlowAmount: { positive: true } });
