import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS, TAX_ACCOUNTING_BASIS } from "../../assets/js/config/constants.js";
import { calculateAmountInYen, validateSameTaxBasis, validateSameUnit } from "../../assets/js/calculators/unit.js";
import { calculateAdoptedValue, calculateNumbers, createValidationResult, isMissing, validateNumber, validateRate } from "../../assets/js/calculators/validation.js";

test("空欄と0を区別する", () => {
  assert.equal(isMissing(null), true);
  assert.equal(isMissing(undefined), true);
  assert.equal(isMissing(""), true);
  assert.equal(isMissing(0), false);
});

test("数値・整数・非負・正値・率を分類する", () => {
  const missing = createValidationResult();
  validateNumber(missing, "amount", "");
  assert.equal(missing.missingFields[0].code, "REQUIRED");

  const invalid = createValidationResult();
  validateNumber(invalid, "count", 1.5, { integer: true });
  validateNumber(invalid, "amount", -1, { nonNegative: true });
  validateNumber(invalid, "divisor", 0, { positive: true });
  validateRate(invalid, "rate", 1.01);
  assert.deepEqual(invalid.errors.map(({ code }) => code), ["INTEGER_REQUIRED", "NON_NEGATIVE_REQUIRED", "POSITIVE_REQUIRED", "RATE_OUT_OF_RANGE"]);
});

test("Calculator共通返却は警告を保持し、Errorと不足で計算を止める", () => {
  const ok = calculateNumbers((a, b) => a + b, { a: 0, b: 2 }, { a: { nonNegative: true } });
  assert.deepEqual(ok, { value: 2, errors: [], warnings: [], missingFields: [] });
  const missing = calculateNumbers((a, b) => a + b, { a: "", b: 2 });
  assert.equal(missing.value, null);
  assert.equal(missing.missingFields.length, 1);
  const error = calculateNumbers((a, b) => a / b, { a: 1, b: 0 }, { b: { nonZero: true } });
  assert.equal(error.value, null);
  assert.equal(error.errors[0].code, "DIVISION_BY_ZERO");
});

test("金額単位と税込／税抜区分の一致を検証する", () => {
  assert.equal(calculateAmountInYen(2, AMOUNT_INPUT_UNITS.THOUSAND_YEN).value, 2_000);
  assert.equal(calculateAmountInYen("", AMOUNT_INPUT_UNITS.YEN).missingFields.length, 1);
  assert.equal(validateSameUnit(AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.YEN).errors.length, 0);
  assert.equal(validateSameUnit(AMOUNT_INPUT_UNITS.YEN, AMOUNT_INPUT_UNITS.THOUSAND_YEN).errors[0].code, "UNIT_MISMATCH");
  assert.equal(validateSameTaxBasis(TAX_ACCOUNTING_BASIS.INCLUDED, TAX_ACCOUNTING_BASIS.EXCLUDED).errors[0].code, "TAX_BASIS_MISMATCH");
});

test("採用値Calculatorは型・率・金額端数を検証する", () => {
  assert.equal(calculateAdoptedValue(100.5, { monetary: true }).value, 101);
  assert.equal(calculateAdoptedValue(Number.NaN, { type: "number" }).errors[0].code, "INVALID_NUMBER");
  assert.equal(calculateAdoptedValue(Number.POSITIVE_INFINITY, { type: "number" }).errors[0].code, "INVALID_NUMBER");
  assert.equal(calculateAdoptedValue(1.1, { type: "rate" }).errors[0].code, "RATE_OUT_OF_RANGE");
  assert.equal(calculateAdoptedValue("AUTO", { type: "string", allowedValues: ["AUTO"] }).value, "AUTO");
});
