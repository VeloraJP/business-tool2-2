import * as calculator from "../calculators/cash-flow.js";
import { createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runCashFlowEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, { cashBalance: ["cashBalance", "BS001"], monthlyCashIn: "monthlyCashIn", monthlyCashOut: "monthlyCashOut", monthlyLoanPayment: "monthlyLoanPayment", projectionMonths: "projectionMonths" });
  recordResolvedValue(result, "cashBalance", input.cashBalance, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  recordResolvedValue(result, "monthlyCashIn", input.monthlyCashIn, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  recordResolvedValue(result, "monthlyCashOut", input.monthlyCashOut, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  const cashBalance = derivedInput(result.results.cashBalance, "cashBalance");
  const monthlyCashIn = derivedInput(result.results.monthlyCashIn, "monthlyCashIn");
  const monthlyCashOut = derivedInput(result.results.monthlyCashOut, "monthlyCashOut");
  const monthlyLoanPayment = input.monthlyLoanPayment.missing
    ? {
      field: "monthlyLoanPayment",
      value: 0,
      missing: false,
      source: { type: "DERIVED_SOURCE", field: "monthlyLoanPayment", detail: { reason: "OPTIONAL_DEFAULT_ZERO" } }
    }
    : input.monthlyLoanPayment;
  recordCalculation(result, "monthlyNetCashOutflow", calculator.calculateMonthlyNetCashOutflow(monthlyCashOut.value, monthlyLoanPayment.value, monthlyCashIn.value), { formula: "monthlyCashOut + monthlyLoanPayment - monthlyCashIn", rounding: "ROUND_YEN", inputs: { monthlyCashOut, monthlyLoanPayment, monthlyCashIn } });
  const netOutflow = derivedInput(result.results.monthlyNetCashOutflow, "monthlyNetCashOutflow");
  recordCalculation(result, "cashRunwayMonths", calculator.calculateCashRunwayMonths(cashBalance.value, netOutflow.value), { formula: "cashBalance ÷ monthlyNetCashOutflow", inputs: { cashBalance, monthlyNetCashOutflow: netOutflow }, conditions: ["NO_NUMERIC_RESULT_WHEN_OUTFLOW_LE_ZERO"] });
  recordCalculation(result, "simpleBalanceProjection", calculator.calculateProjectedCashBalance(cashBalance.value, netOutflow.value, input.projectionMonths.value), { formula: "cashBalance - monthlyNetCashOutflow × projectionMonths", rounding: "ROUND_YEN", inputs: { cashBalance, monthlyNetCashOutflow: netOutflow, projectionMonths: input.projectionMonths } });
  return result;
}
