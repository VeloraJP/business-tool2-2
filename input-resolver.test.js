import test from "node:test";
import assert from "node:assert/strict";
import { runCashFlowEngine } from "../../assets/js/engines/cash-flow-engine.js";

test("資金繰りEngineは月間入力だけで計算する", () => {
  const result = runCashFlowEngine({ screenManual: { cashBalance: 2_000, monthlyCashIn: 800, monthlyCashOut: 900, monthlyLoanPayment: 200, projectionMonths: 3 } });
  assert.equal(result.results.monthlyNetCashOutflow, 300);
  assert.equal(result.results.simpleBalanceProjection, 1_100);
  assert.equal(result.results.cashRunwayMonths, 20 / 3);
});

test("純流出0以下は資金余命を数値化せずWarningにしない", () => {
  const result = runCashFlowEngine({ screenManual: { cashBalance: 2_000, monthlyCashIn: 1_000, monthlyCashOut: 800, monthlyLoanPayment: 0, projectionMonths: 3 } });
  assert.equal(result.results.cashRunwayMonths, null);
  assert.equal(result.warnings.length, 0);
});

test("月間返済支出未入力は0を採用し出典を記録する", () => {
  const result = runCashFlowEngine({ screenManual: { cashBalance: 2_000, monthlyCashIn: 800, monthlyCashOut: 900, projectionMonths: 3 } });
  assert.equal(result.results.monthlyNetCashOutflow, 100);
  assert.equal(result.usedInputs.monthlyNetCashOutflow.monthlyLoanPayment, 0);
  assert.equal(result.inputSources.monthlyNetCashOutflow.monthlyLoanPayment.type, "DERIVED_SOURCE");
  assert.equal(result.inputSources.monthlyNetCashOutflow.monthlyLoanPayment.detail.reason, "OPTIONAL_DEFAULT_ZERO");
  assert.equal(result.missingFields.some(({ field }) => field === "monthlyLoanPayment"), false);
});

test("明示した月間返済支出は既定0より優先する", () => {
  const result = runCashFlowEngine({ screenManual: { cashBalance: 2_000, monthlyCashIn: 800, monthlyCashOut: 900, monthlyLoanPayment: 50, projectionMonths: 3 } });
  assert.equal(result.results.monthlyNetCashOutflow, 150);
  assert.equal(result.inputSources.monthlyNetCashOutflow.monthlyLoanPayment.type, "SCREEN_MANUAL");
});
