import test from "node:test";
import assert from "node:assert/strict";
import { LOAN_REPAYMENT_METHODS } from "../../assets/js/config/constants.js";
import { runLoanRepaymentEngine } from "../../assets/js/engines/loan-repayment-engine.js";

test("借入返済Engineは予定表を正本として集計する", () => {
  const result = runLoanRepaymentEngine({ screenManual: { loanAmount: 1_200, interestRate: 0, repaymentMonths: 12, repaymentMethod: LOAN_REPAYMENT_METHODS.EQUAL_PAYMENT, annualPreDebtServiceCashFlow: 2_400 } });
  assert.equal(result.results.paymentSchedule.length, 12);
  assert.equal(result.results.monthlyPayment, 100);
  assert.equal(result.results.annualPayment, 1_200);
  assert.equal(result.results.totalPayment, 1_200);
  assert.equal(result.results.dscr, 2);
});

test("予定表不足でも別の直接計算可能項目を継続する", () => {
  const result = runLoanRepaymentEngine({ screenManual: { loanAmount: 2_000, shortTermBorrowings: 2_000, longTermBorrowings: 0, operatingProfit: 1_000, depreciation: 0 } });
  assert.equal(result.results.debtRepaymentYears, 2);
  assert.equal(result.missingFields.some(({ resultName }) => resultName === "paymentSchedule"), true);
});

test("採用した借入条件を金額・率・整数・方式別に検証する", () => {
  const result = runLoanRepaymentEngine({ screenManual: {
    loanAmount: 100.5,
    interestRate: 1.1,
    repaymentMonths: 1.5,
    repaymentMethod: "UNKNOWN"
  } });
  assert.equal(result.results.loanAmount, 101);
  assert.equal(result.results.interestRate, null);
  assert.equal(result.results.repaymentMonths, null);
  assert.equal(result.results.repaymentMethod, null);
  assert.equal(result.errors.some(({ code }) => code === "RATE_OUT_OF_RANGE"), true);
  assert.equal(result.errors.some(({ code }) => code === "INTEGER_REQUIRED"), true);
  assert.equal(result.errors.some(({ code }) => code === "INVALID_VALUE"), true);
});
