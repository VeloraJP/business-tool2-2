import {
  compoundAnnualGrowthRate,
  difference,
  growthRate
} from "./common.js";

export function growthDifference(previousValue, currentValue) {
  return difference(currentValue, previousValue);
}

export function annualGrowthRate(previousValue, currentValue) {
  return growthRate(currentValue, previousValue);
}

export function cagr(initialValue, finalValue, years) {
  return compoundAnnualGrowthRate(initialValue, finalValue, years);
}

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

function utcDate(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate()
    ));
  }
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function anniversary(source, yearOffset) {
  const year = source.getUTCFullYear() + yearOffset;
  const month = source.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(source.getUTCDate(), lastDay)));
}

export function elapsedYearsActAct(sourcePeriodEnd, targetPeriodEnd) {
  const source = utcDate(sourcePeriodEnd);
  const target = utcDate(targetPeriodEnd);
  let fullYears = target.getUTCFullYear() - source.getUTCFullYear();
  if (anniversary(source, fullYears) > target) fullYears -= 1;
  const currentAnniversary = anniversary(source, fullYears);
  const nextAnniversary = anniversary(source, fullYears + 1);
  const remainingDays = (target - currentAnniversary) / DAY_MILLISECONDS;
  const intervalDays = (nextAnniversary - currentAnniversary) / DAY_MILLISECONDS;
  return fullYears + remainingDays / intervalDays;
}
