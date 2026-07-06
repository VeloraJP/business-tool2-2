import { AMOUNT_INPUT_UNITS } from "../config/constants.js";

export function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function difference(minuend, subtrahend) {
  return minuend - subtrahend;
}

export function ratio(numerator, denominator) {
  return numerator / denominator;
}

export function average(values) {
  return sum(values) / values.length;
}

export function growthRate(currentValue, previousValue) {
  return difference(currentValue, previousValue) / previousValue;
}

export function compoundAnnualGrowthRate(initialValue, finalValue, years) {
  return (finalValue / initialValue) ** (1 / years) - 1;
}

export function convertAmountToYen(value, inputUnit) {
  const factors = {
    [AMOUNT_INPUT_UNITS.YEN]: 1,
    [AMOUNT_INPUT_UNITS.THOUSAND_YEN]: 1_000,
    [AMOUNT_INPUT_UNITS.TEN_THOUSAND_YEN]: 10_000
  };

  return value * factors[inputUnit];
}

export function roundYen(value) {
  return value < 0
    ? -Math.round(Math.abs(value))
    : Math.round(value);
}

export function roundMonthlyPayment(value) {
  return roundYen(value);
}

export function ceilRequiredQuantity(value) {
  return Math.ceil(value);
}

