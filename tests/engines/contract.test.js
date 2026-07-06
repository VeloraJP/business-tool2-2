import test from "node:test";
import assert from "node:assert/strict";
import { ENGINE_RESULT_KEYS, createEngineResult, recordCalculation, recordResolvedValue } from "../../assets/js/engines/contract.js";

test("Engine共通返却形式は7項目だけを持つ", () => {
  const result = createEngineResult();
  assert.deepEqual(Object.keys(result), ENGINE_RESULT_KEYS);
  assert.equal(Object.hasOwn(result, "accuracy"), false);
  assert.equal(Object.hasOwn(result, "inputLevel"), false);
});

test("Calculator結果を結果名へ対応付けて集約する", () => {
  const result = createEngineResult();
  recordCalculation(result, "sample", { value: null, errors: [{ field: "x", code: "INVALID", message: "invalid" }], warnings: [], missingFields: [] }, { formula: "x", inputs: { x: { value: 0, missing: false, source: { type: "SCREEN_MANUAL" } } } });
  assert.equal(result.results.sample, null);
  assert.equal(result.errors[0].resultName, "sample");
  assert.equal(result.usedInputs.sample.x, 0);
  assert.equal(result.inputSources.sample.x.type, "SCREEN_MANUAL");
});

test("採用済み金額を検証して実際に1円四捨五入する", () => {
  const rounded = createEngineResult();
  recordResolvedValue(rounded, "salesAmount", {
    field: "PL001", value: 100.5, missing: false,
    source: { type: "SCREEN_MANUAL", field: "PL001" }
  }, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  assert.equal(rounded.results.salesAmount, 101);
  assert.equal(rounded.calculationBasis.salesAmount.rounding, "ROUND_YEN");

  const invalid = createEngineResult();
  recordResolvedValue(invalid, "salesAmount", {
    field: "PL001", value: -1, missing: false,
    source: { type: "SCREEN_MANUAL", field: "PL001" }
  }, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  assert.equal(invalid.results.salesAmount, null);
  assert.equal(invalid.errors.some(({ code }) => code === "NON_NEGATIVE_REQUIRED"), true);
});

test("mode不整合の採用候補をEngine結果でErrorにする", () => {
  const result = createEngineResult();
  recordResolvedValue(result, "grossProfit", {
    field: "PL003", value: 600, missing: false, invalid: true,
    resolutionErrors: [{ field: "PL003", code: "MODE_SOURCE_MISMATCH", message: "mode不整合" }],
    source: { type: "SAVED_MANUAL", field: "PL003" }
  }, { rounding: "ROUND_YEN" });
  assert.equal(result.results.grossProfit, null);
  assert.equal(result.errors[0].code, "MODE_SOURCE_MISMATCH");
});
