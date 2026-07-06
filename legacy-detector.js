import { ratio, sum } from "./common.js";

export function laborCostTotal(executiveCompensation, salaries, statutoryBenefits) {
  return sum([executiveCompensation, salaries, statutoryBenefits]);
}

export function laborCostRate(laborCosts, salesAmount) {
  return ratio(laborCosts, salesAmount);
}

export function additionalSalary(expectedSalaryPerPerson, plannedHireCount) {
  return expectedSalaryPerPerson * plannedHireCount;
}

export function socialInsuranceEstimate(additionalSalaryAmount, rate) {
  return additionalSalaryAmount * rate;
}

export function additionalLaborCost(additionalSalaryAmount, socialInsuranceAmount) {
  return additionalSalaryAmount + socialInsuranceAmount;
}

export function laborCostAfterHiring(currentLaborCosts, additionalLaborCosts) {
  return currentLaborCosts + additionalLaborCosts;
}

export function operatingProfitAfterHiring(
  currentOperatingProfit,
  expectedAdditionalSales,
  marginalProfitRateValue,
  additionalLaborCosts
) {
  return currentOperatingProfit +
    expectedAdditionalSales * marginalProfitRateValue -
    additionalLaborCosts;
}

export function requiredAdditionalSales(
  additionalLaborCosts,
  marginalProfitRateValue
) {
  return ratio(additionalLaborCosts, marginalProfitRateValue);
}

export function salesPerEmployee(salesAmount, employeeCount) {
  return ratio(salesAmount, employeeCount);
}
