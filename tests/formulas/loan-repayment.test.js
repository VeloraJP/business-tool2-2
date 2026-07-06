import test from "node:test";
import assert from "node:assert/strict";
import * as loan from "../../assets/js/formulas/loan-repayment.js";

function assertSchedule(schedule, loanAmount, months) {
  assert.equal(schedule.length, months);
  assert.equal(schedule.reduce((sum, row) => sum + row.principal, 0), loanAmount);
  assert.equal(schedule.at(-1).closingBalance, 0);
  schedule.forEach((row, index) => {
    assert.equal(row.month, index + 1);
    assert.equal(Number.isInteger(row.principal), true);
    assert.equal(Number.isInteger(row.interest), true);
    assert.equal(Number.isInteger(row.payment), true);
    assert.equal(row.payment, row.principal + row.interest);
  });
}

test("元利均等返済予定表は最終月に残高を調整する", () => {
  const schedule = loan.equalPaymentSchedule(1_000_000, 0.12, 12);
  assertSchedule(schedule, 1_000_000, 12);
  assert.equal(loan.totalPayment(schedule), 1_000_000 + loan.totalInterest(schedule));
  assert.equal(loan.annualPayment(schedule), loan.totalPayment(schedule));
});

test("元金均等返済予定表は端数を最終月に調整する", () => {
  const schedule = loan.equalPrincipalSchedule(1_000_000, 0.12, 12);
  assertSchedule(schedule, 1_000_000, 12);
  assert.notEqual(schedule[0].payment, schedule.at(-1).payment);
});

test("利率0・1か月・1円を処理する", () => {
  assert.equal(loan.monthlyInterestRate(0.12), 0.01);
  assert.equal(loan.equalPaymentAmount(1_200, 0, 12), 100);
  assertSchedule(loan.equalPaymentSchedule(1, 0, 1), 1, 1);
  assertSchedule(loan.equalPrincipalSchedule(1, 0, 2), 1, 2);
});

test("年返済額は指定月から最大12か月を集計する", () => {
  const schedule = loan.equalPrincipalSchedule(2_400, 0, 24);
  assert.equal(loan.annualPayment(schedule, 0), 1_200);
  assert.equal(loan.annualPayment(schedule, 12), 1_200);
  assert.equal(loan.dscr(2_400, 1_200), 2);
  assert.equal(loan.debtRepaymentYears(2_400, 1_200), 2);
});
