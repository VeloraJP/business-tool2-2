import { calculateAmountInYen } from "../calculators/unit.js";

export function convertAmountInputToYen(value, inputUnit) {
  return calculateAmountInYen(value, inputUnit);
}

export function formatYenForAmountInput(yenValue, inputUnit) {
  if (yenValue === null || yenValue === undefined || yenValue === "") return "";
  const unit = calculateAmountInYen(1, inputUnit);
  if (unit.value === null) return { value: null, errors: unit.errors, warnings: [], missingFields: unit.missingFields };
  return { value: yenValue / unit.value, errors: [], warnings: [], missingFields: [] };
}
