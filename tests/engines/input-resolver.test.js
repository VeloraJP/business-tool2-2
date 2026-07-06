import test from "node:test";
import assert from "node:assert/strict";
import { INPUT_RESOLUTION_CODES, INPUT_SOURCE_TYPES, resolveContextList, resolveInput } from "../../assets/js/engines/input-resolver.js";

test("入力優先順位を画面MANUALから元データまで固定する", () => {
  const context = { screenManual: { x: 1 }, savedManual: { x: 2 }, savedAuto: { x: 3 }, derived: { x: 4 } };
  assert.equal(resolveInput("x", context).value, 1);
  assert.equal(resolveInput("x", { ...context, screenManual: { x: "" } }).value, 2);
  assert.equal(resolveInput("x", { derived: { x: 4 } }).source.type, INPUT_SOURCE_TYPES.DERIVED_SOURCE);
});

test("0を採用し、空欄は不足として扱う", () => {
  assert.equal(resolveInput("x", { screenManual: { x: 0 }, savedManual: { x: 2 } }).value, 0);
  const missing = resolveInput(["x", "PL001"], { screenManual: { x: null }, savedManual: { PL001: "" } });
  assert.equal(missing.missing, true);
  assert.equal(missing.source.type, INPUT_SOURCE_TYPES.MISSING);
});

test("保存候補のmodeと入力元が矛盾する値を拒否する", () => {
  const invalidManual = resolveInput("PL003", {
    savedManual: { PL003: { value: 600, mode: "AUTO" } },
    savedAuto: { PL003: { value: 500, mode: "AUTO" } }
  });
  assert.equal(invalidManual.invalid, true);
  assert.equal(invalidManual.resolutionErrors[0].code, INPUT_RESOLUTION_CODES.MODE_SOURCE_MISMATCH);
  assert.equal(invalidManual.value, 600);

  const validAuto = resolveInput("PL003", {
    savedAuto: { PL003: { value: 0, mode: "AUTO" } }
  });
  assert.equal(validAuto.invalid, false);
  assert.equal(validAuto.value, 0);
  assert.equal(validAuto.source.type, INPUT_SOURCE_TYPES.SAVED_AUTO);
});

test("税区分・単位は配列、単一値、derivedの順で入力契約へ接続する", () => {
  assert.deepEqual(resolveContextList({ units: ["YEN", "YEN"], amountInputUnit: "THOUSAND_YEN" }, "units", "amountInputUnit"), ["YEN", "YEN"]);
  assert.deepEqual(resolveContextList({ amountInputUnit: "YEN" }, "units", "amountInputUnit"), ["YEN"]);
  assert.deepEqual(resolveContextList({ derived: { amountInputUnit: "THOUSAND_YEN" } }, "units", "amountInputUnit"), ["THOUSAND_YEN"]);
  assert.deepEqual(resolveContextList({}, "units", "amountInputUnit"), [null]);
});
