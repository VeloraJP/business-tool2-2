import test from "node:test";
import assert from "node:assert/strict";
import { LOAN_REPAYMENT_METHODS } from "../../assets/js/config/constants.js";
import * as loan from "../../assets/js/calculators/loan-repayment.js";

test("借入Calculatorは返済方式を選択して予定表を返す", () => {
  const equalPayment = loan.calculateRepaymentSchedule(1_000, 0, 10, LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT);
  const equalPrincipal = loan.calculateRepaymentSchedule(1_000, 0, 10, LOAN_REPAYMENT_METHODS.EQUAL_PRINCIPAL);
  assert.equal(equalPayment.value.length, 10);
  assert.equal(equalPrincipal.value.length, 10);
  assert.equal(loan.calculateTotalPayment(equalPayment.value).value, 1_000);
  assert.equal(loan.calculateTotalInterest(equalPayment.value).value, 0);
});

test("借入Calculatorは金利・期間・方式・予定表を検証する", () => {
  assert.equal(loan.calculateRepaymentSchedule(1_000, -0.01, 10, LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT).value, null);
  assert.equal(loan.calculateRepaymentSchedule(1_000, 0, 0, LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT).value, null);
  assert.equal(loan.calculateRepaymentSchedule(1_000, 0, 10, "UNKNOWN").value, null);
  assert.equal(loan.calculateRepaymentSchedule(1_000, 0, 10, "").missingFields[0].field, "method");
  assert.equal(loan.calculateAnnualPayment("invalid").value, null);
  assert.equal(loan.calculateTotalPayment("invalid").value, null);
});

test("DSCRと債務償還年数は分母0を拒否する", () => {
  assert.equal(loan.calculateDscr(2_000, 1_000).value, 2);
  assert.equal(loan.calculateDscr(2_000, 0).value, null);
  assert.equal(loan.calculateDebtRepaymentYears(2_000, 1_000).value, 2);
  assert.equal(loan.calculateDebtRepaymentYears(2_000, 0).value, null);
});
