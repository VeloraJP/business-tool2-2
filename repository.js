import {
  roundMonthlyPayment,
  roundYen,
  sum
} from "./common.js";

export function monthlyInterestRate(annualInterestRate) {
  return annualInterestRate / 12;
}

export function equalPaymentAmount(
  loanAmount,
  annualInterestRate,
  repaymentMonths
) {
  const monthlyRate = monthlyInterestRate(annualInterestRate);

  if (monthlyRate === 0) {
    return loanAmount / repaymentMonths;
  }

  const factor = (1 + monthlyRate) ** repaymentMonths;
  return loanAmount * monthlyRate * factor / (factor - 1);
}

function scheduleRow(month, openingBalance, principal, interest) {
  const payment = principal + interest;
  const closingBalance = Math.max(0, openingBalance - principal);

  return {
    month,
    openingBalance,
    principal,
    interest,
    payment,
    closingBalance
  };
}

export function equalPaymentSchedule(
  loanAmount,
  annualInterestRate,
  repaymentMonths
) {
  const monthlyRate = monthlyInterestRate(annualInterestRate);
  const regularPayment = roundMonthlyPayment(
    equalPaymentAmount(loanAmount, annualInterestRate, repaymentMonths)
  );
  const schedule = [];
  let remainingBalance = loanAmount;

  for (let month = 1; month <= repaymentMonths; month += 1) {
    const interest = roundYen(remainingBalance * monthlyRate);
    const isLastMonth = month === repaymentMonths;
    const principal = isLastMonth
      ? remainingBalance
      : Math.min(remainingBalance, Math.max(0, regularPayment - interest));
    const row = scheduleRow(
      month,
      remainingBalance,
      principal,
      interest
    );

    schedule.push(row);
    remainingBalance = row.closingBalance;
  }

  return schedule;
}

export function equalPrincipalSchedule(
  loanAmount,
  annualInterestRate,
  repaymentMonths
) {
  const monthlyRate = monthlyInterestRate(annualInterestRate);
  const regularPrincipal = roundYen(loanAmount / repaymentMonths);
  const schedule = [];
  let remainingBalance = loanAmount;

  for (let month = 1; month <= repaymentMonths; month += 1) {
    const isLastMonth = month === repaymentMonths;
    const principal = isLastMonth
      ? remainingBalance
      : Math.min(remainingBalance, regularPrincipal);
    const interest = roundYen(remainingBalance * monthlyRate);
    const row = scheduleRow(
      month,
      remainingBalance,
      principal,
      interest
    );

    schedule.push(row);
    remainingBalance = row.closingBalance;
  }

  return schedule;
}

export function annualPayment(schedule, startMonthIndex = 0) {
  return sum(
    schedule
      .slice(startMonthIndex, startMonthIndex + 12)
      .map(({ payment }) => payment)
  );
}

export function totalPayment(schedule) {
  return sum(schedule.map(({ payment }) => payment));
}

export function totalInterest(schedule) {
  return sum(schedule.map(({ interest }) => interest));
}

export function dscr(annualPreDebtServiceCashFlow, annualPaymentAmount) {
  return annualPreDebtServiceCashFlow / annualPaymentAmount;
}

export function totalInterestBearingDebt(shortTermBorrowings, longTermBorrowings) {
  return shortTermBorrowings + longTermBorrowings;
}

export function simpleRepaymentCashFlow(operatingProfit, depreciation) {
  return operatingProfit + depreciation;
}

export function debtRepaymentYears(
  totalInterestBearingDebtAmount,
  simpleRepaymentCashFlowAmount
) {
  return totalInterestBearingDebtAmount / simpleRepaymentCashFlowAmount;
}
