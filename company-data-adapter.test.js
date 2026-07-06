import assert from "node:assert/strict";
import test from "node:test";
import {
  AMOUNT_DISPLAY_UNITS,
  AMOUNT_INPUT_UNITS,
  APP_VERSION,
  MAX_IMPORT_BYTES,
  MAX_PERIODS,
  SCHEMA_VERSION,
  STORAGE_KEYS,
  TAX_ACCOUNTING_BASIS,
  VALUE_MODES
} from "../../assets/js/config/constants.js";

test("Phase 1の仕様定数が凍結仕様と一致する", () => {
  assert.equal(STORAGE_KEYS.PRIMARY, "managementAnalysis.ver1");
  assert.equal(STORAGE_KEYS.LEGACY, "faPro");
  assert.equal(SCHEMA_VERSION, "1.0");
  assert.equal(APP_VERSION, "1.0");
  assert.equal(MAX_PERIODS, 3);
  assert.equal(MAX_IMPORT_BYTES, 5 * 1024 * 1024);
  assert.deepEqual(Object.values(TAX_ACCOUNTING_BASIS), [
    "TAX_INCLUDED",
    "TAX_EXCLUDED"
  ]);
  assert.deepEqual(Object.values(VALUE_MODES), ["AUTO", "MANUAL"]);
  assert.deepEqual(Object.values(AMOUNT_INPUT_UNITS), [
    "YEN",
    "THOUSAND_YEN",
    "TEN_THOUSAND_YEN"
  ]);
  assert.deepEqual(Object.values(AMOUNT_DISPLAY_UNITS), [
    "yen",
    "thousandYen",
    "tenThousandYen"
  ]);
});

