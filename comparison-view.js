export function corporateTaxEstimate(incomeBeforeTax, effectiveTaxRate) {
  return incomeBeforeTax > 0
    ? incomeBeforeTax * effectiveTaxRate
    : 0;
}

export function profitAfterTax(incomeBeforeTax, corporateTaxEstimateAmount) {
  return incomeBeforeTax - corporateTaxEstimateAmount;
}

