import { AMOUNT_INPUT_UNITS, TAX_ACCOUNTING_BASIS } from "../config/constants.js";
import { convertAmountToYen } from "../formulas/common.js";
import {
  VALIDATION_CODES,
  calculateWithValidation,
  createValidationResult,
  isMissing,
  validateNumber,
} from "./validation.js";

function validateEnum(result, field, value, allowedValues) {
  if (isMissing(value)) {
    result.missingFields.push({ field, code: VALIDATION_CODES.REQUIRED, message: `${field}は必須です。` });
  } else if (!allowedValues.includes(value)) {
    result.errors.push({ field, code: "INVALID_VALUE", message: `${field}の値が不正です。` });
  }
}

export function calculateAmountInYen(value, inputUnit) {
  const validation = createValidationResult();
  validateNumber(validation, "value", value);
  validateEnum(validation, "inputUnit", inputUnit, Object.values(AMOUNT_INPUT_UNITS));
  return calculateWithValidation(validation, () => convertAmountToYen(value, inputUnit));
}

export function validateSameUnit(...units) {
  const validation = createValidationResult();
  units.forEach((unit, index) => validateEnum(validation, `unit${index + 1}`, unit, Object.values(AMOUNT_INPUT_UNITS)));
  if (validation.errors.length === 0 && validation.missingFields.length === 0 && new Set(units).size > 1) {
    validation.errors.push({ field: "units", code: VALIDATION_CODES.UNIT_MISMATCH, message: "入力単位を統一してください。" });
  }
  return validation;
}

export function validateSameTaxBasis(...taxBases) {
  const validation = createValidationResult();
  taxBases.forEach((basis, index) => validateEnum(validation, `taxBasis${index + 1}`, basis, Object.values(TAX_ACCOUNTING_BASIS)));
  if (validation.errors.length === 0 && validation.missingFields.length === 0 && new Set(taxBases).size > 1) {
    validation.errors.push({ field: "taxBases", code: VALIDATION_CODES.TAX_BASIS_MISMATCH, message: "税込／税抜区分を統一してください。" });
  }
  return validation;
}
