import { ratio } from "./common.js";

export function monthlyNetCashOutflow(
  monthlyCashOut,
  monthlyLoanPayment,
  monthlyCashIn
) {
  return monthlyCashOut + monthlyLoanPayment - monthlyCashIn;
}

export function projectedCashBalance(
  cashBalance,
  monthlyNetCashOutflowAmount,
  months
) {
  return cashBalance - monthlyNetCashOutflowAmount * months;
}

export function cashRunwayMonths(cashBalance, monthlyNetCashOutflowAmount) {
  return ratio(cashBalance, monthlyNetCashOutflowAmount);
}

