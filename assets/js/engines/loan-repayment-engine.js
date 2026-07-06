import * as calculator from "../calculators/loan-repayment.js";
import { LOAN_REPAYMENT_METHODS } from "../config/constants.js";
import { createEngineResult, createMissingCalculation, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runLoanRepaymentEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    loanAmount: "loanAmount", interestRate: "interestRate", repaymentMonths: "repaymentMonths",
    repaymentMethod: "repaymentMethod", annualPreDebtServiceCashFlow: "annualPreDebtServiceCashFlow", annualPaymentInput: "annualPayment",
    shortTermBorrowings: ["shortTermBorrowings", "BS014"], longTermBorrowings: ["longTermBorrowings", "BS019"],
    operatingProfit: ["operatingProfit", "PL017"], depreciation: ["depreciation", "PL013"]
  });
  recordResolvedValue(result, "loanAmount", input.loanAmount, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  recordResolvedValue(result, "interestRate", input.interestRate, { validation: { type: "rate" } });
  recordResolvedValue(result, "repaymentMonths", input.repaymentMonths, { validation: { type: "number", integer: true, positive: true } });
  recordResolvedValue(result, "repaymentMethod", input.repaymentMethod, { validation: { type: "string", allowedValues: Object.values(LOAN_REPAYMENT_METHODS) } });
  const loanAmount = derivedInput(result.results.loanAmount, "loanAmount");
  const interestRate = derivedInput(result.results.interestRate, "interestRate");
  const repaymentMonths = derivedInput(result.results.repaymentMonths, "repaymentMonths");
  const repaymentMethod = derivedInput(result.results.repaymentMethod, "repaymentMethod");
  const scheduleCalculation = calculator.calculateRepaymentSchedule(loanAmount.value, interestRate.value, repaymentMonths.value, repaymentMethod.value);
  recordCalculation(result, "paymentSchedule", scheduleCalculation, { formula: "EQUAL_PAYMENT_OR_EQUAL_PRINCIPAL_SCHEDULE", rounding: "ROUND_MONTHLY_PAYMENT_AND_ADJUST_FINAL_MONTH", inputs: { loanAmount, interestRate, repaymentMonths, repaymentMethod } });
  const schedule = result.results.paymentSchedule;
  const scheduleInput = derivedInput(schedule, "paymentSchedule");
  const scheduleAvailable = Array.isArray(schedule);
  const annualCalculation = scheduleAvailable ? calculator.calculateAnnualPayment(schedule) : createMissingCalculation(["paymentSchedule"]);
  recordCalculation(result, "annualPayment", annualCalculation, { formula: "sum(paymentSchedule up to 12 months)", rounding: "ROUND_YEN", inputs: { paymentSchedule: scheduleInput } });
  const monthlyCalculation = scheduleAvailable && schedule.length > 0
    ? { value: schedule[0].payment, errors: [], warnings: [], missingFields: [] }
    : createMissingCalculation(["paymentSchedule"]);
  recordCalculation(result, "monthlyPayment", monthlyCalculation, { formula: "paymentSchedule[0].payment", rounding: "ROUND_YEN", inputs: { paymentSchedule: scheduleInput } });
  recordCalculation(result, "totalPayment", scheduleAvailable ? calculator.calculateTotalPayment(schedule) : createMissingCalculation(["paymentSchedule"]), { formula: "sum(paymentSchedule.payment)", rounding: "ROUND_YEN", inputs: { paymentSchedule: scheduleInput } });
  recordCalculation(result, "totalInterest", scheduleAvailable ? calculator.calculateTotalInterest(schedule) : createMissingCalculation(["paymentSchedule"]), { formula: "sum(paymentSchedule.interest)", rounding: "ROUND_YEN", inputs: { paymentSchedule: scheduleInput } });
  const annual = input.annualPaymentInput.missing ? derivedInput(result.results.annualPayment, "annualPayment") : input.annualPaymentInput;
  recordResolvedValue(result, "annualPreDebtServiceCashFlow", input.annualPreDebtServiceCashFlow, { rounding: "ROUND_YEN", validation: { type: "number" } });
  const preDebtCashFlow = derivedInput(result.results.annualPreDebtServiceCashFlow, "annualPreDebtServiceCashFlow");
  recordCalculation(result, "dscr", calculator.calculateDscr(preDebtCashFlow.value, annual.value), { formula: "annualPreDebtServiceCashFlow ÷ annualPayment", inputs: { annualPreDebtServiceCashFlow: preDebtCashFlow, annualPayment: annual } });
  recordCalculation(result, "totalInterestBearingDebt", calculator.calculateTotalInterestBearingDebt(input.shortTermBorrowings.value, input.longTermBorrowings.value), { formula: "shortTermBorrowings + longTermBorrowings", rounding: "ROUND_YEN", inputs: { shortTermBorrowings: input.shortTermBorrowings, longTermBorrowings: input.longTermBorrowings } });
  recordCalculation(result, "simpleRepaymentCashFlow", calculator.calculateSimpleRepaymentCashFlow(input.operatingProfit.value, input.depreciation.value), { formula: "operatingProfit + depreciation", rounding: "ROUND_YEN", inputs: { operatingProfit: input.operatingProfit, depreciation: input.depreciation }, conditions: ["EXCLUDES_TAX_CAPEX_AND_WORKING_CAPITAL"] });
  const totalDebt = derivedInput(result.results.totalInterestBearingDebt, "totalInterestBearingDebt");
  const repaymentCashFlow = derivedInput(result.results.simpleRepaymentCashFlow, "simpleRepaymentCashFlow");
  recordCalculation(result, "debtRepaymentYears", calculator.calculateDebtRepaymentYears(totalDebt.value, repaymentCashFlow.value), { formula: "totalInterestBearingDebt ÷ simpleRepaymentCashFlow", inputs: { totalInterestBearingDebt: totalDebt, simpleRepaymentCashFlow: repaymentCashFlow } });
  return result;
}
