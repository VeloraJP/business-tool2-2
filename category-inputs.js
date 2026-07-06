import { roundYen } from "../formulas/common.js";

export const VALIDATION_CODES = Object.freeze({
  REQUIRED: "REQUIRED",
  INVALID_NUMBER: "INVALID_NUMBER",
  INTEGER_REQUIRED: "INTEGER_REQUIRED",
  NON_NEGATIVE_REQUIRED: "NON_NEGATIVE_REQUIRED",
  POSITIVE_REQUIRED: "POSITIVE_REQUIRED",
  RATE_OUT_OF_RANGE: "RATE_OUT_OF_RANGE",
  DIVISION_BY_ZERO: "DIVISION_BY_ZERO",
  UNIT_MISMATCH: "UNIT_MISMATCH",
  TAX_BASIS_MISMATCH: "TAX_BASIS_MISMATCH",
  INVALID_VALUE: "INVALID_VALUE",
  INVALID_TYPE: "INVALID_TYPE"
});

export function createValidationResult() {
  return { errors: [], warnings: [], missingFields: [] };
}

export function isMissing(value) {
  return value === null || value === undefined || value === "";
}

function issue(field, code, message) {
  return { field, code, message };
}

export function validateNumber(result, field, value, options = {}) {
  if (isMissing(value)) {
    result.missingFields.push(issue(field, VALIDATION_CODES.REQUIRED, `${field}は必須です。`));
    return false;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    result.errors.push(issue(field, VALIDATION_CODES.INVALID_NUMBER, `${field}は有限の数値で入力してください。`));
    return false;
  }

  let valid = true;
  if (options.integer && !Number.isInteger(value)) {
    result.errors.push(issue(field, VALIDATION_CODES.INTEGER_REQUIRED, `${field}は整数で入力してください。`));
    valid = false;
  }
  if (options.nonNegative && value < 0) {
    result.errors.push(issue(field, VALIDATION_CODES.NON_NEGATIVE_REQUIRED, `${field}は0以上で入力してください。`));
    valid = false;
  }
  if (options.positive && value <= 0) {
    result.errors.push(issue(field, VALIDATION_CODES.POSITIVE_REQUIRED, `${field}は0より大きい値で入力してください。`));
    valid = false;
  }
  return valid;
}

export function validateRate(result, field, value) {
  const validNumber = validateNumber(result, field, value);
  if (validNumber && (value < 0 || value > 1)) {
    result.errors.push(issue(field, VALIDATION_CODES.RATE_OUT_OF_RANGE, `${field}は0以上1以下で入力してください。`));
  }
}

export function validateNonZero(result, field, value) {
  const validNumber = validateNumber(result, field, value);
  if (validNumber && value === 0) {
    result.errors.push(issue(field, VALIDATION_CODES.DIVISION_BY_ZERO, `${field}に0は指定できません。`));
  }
}

export function addWarning(result, field, code, message) {
  result.warnings.push(issue(field, code, message));
}

export function hasBlockingIssue(result) {
  return result.errors.length > 0 || result.missingFields.length > 0;
}

export function calculateWithValidation(validation, calculate) {
  return {
    value: hasBlockingIssue(validation) ? null : calculate(),
    errors: validation.errors,
    warnings: validation.warnings,
    missingFields: validation.missingFields,
  };
}

export function calculateNumbers(formula, inputs, rules = {}) {
  const validation = createValidationResult();
  for (const [field, value] of Object.entries(inputs)) {
    const rule = rules[field] ?? {};
    if (rule.rate) {
      validateRate(validation, field, value);
    } else if (rule.nonZero) {
      validateNonZero(validation, field, value);
    } else {
      validateNumber(validation, field, value, rule);
    }
  }
  return calculateWithValidation(validation, () => formula(...Object.values(inputs)));
}

export function calculateMonetaryNumbers(formula, inputs, rules = {}) {
  return calculateNumbers(
    (...values) => roundYen(formula(...values)),
    inputs,
    rules
  );
}

export function calculateAdoptedValue(value, options = {}) {
  const {
    type = options.monetary ? "number" : "value",
    monetary = false,
    allowedValues = [],
    field = "value",
    ...numberRules
  } = options;
  const validation = createValidationResult();

  if (type === "number") {
    validateNumber(validation, field, value, numberRules);
  } else if (type === "rate") {
    validateRate(validation, field, value);
  } else if (type === "string") {
    if (isMissing(value)) {
      validation.missingFields.push(issue(field, VALIDATION_CODES.REQUIRED, `${field}は必須です。`));
    } else if (typeof value !== "string") {
      validation.errors.push(issue(field, VALIDATION_CODES.INVALID_TYPE, `${field}は文字列で入力してください。`));
    } else if (allowedValues.length > 0 && !allowedValues.includes(value)) {
      validation.errors.push(issue(field, VALIDATION_CODES.INVALID_VALUE, `${field}の値が不正です。`));
    }
  } else if (type === "array") {
    if (isMissing(value)) {
      validation.missingFields.push(issue(field, VALIDATION_CODES.REQUIRED, `${field}は必須です。`));
    } else if (!Array.isArray(value)) {
      validation.errors.push(issue(field, VALIDATION_CODES.INVALID_TYPE, `${field}は配列で入力してください。`));
    }
  } else if (isMissing(value)) {
    validation.missingFields.push(issue(field, VALIDATION_CODES.REQUIRED, `${field}は必須です。`));
  }

  return calculateWithValidation(validation, () => monetary ? roundYen(value) : value);
}
