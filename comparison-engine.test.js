import assert from "node:assert/strict";
import test from "node:test";
import {
  COST_CLASSIFICATION_EXCLUSIONS,
  STANDARD_COST_CLASSIFICATIONS
} from "../../assets/js/data/fixed-variable-costs.js";

test("固定費・変動費の標準分類が仕様と一致する", () => {
  assert.deepEqual(STANDARD_COST_CLASSIFICATIONS, {
    PL002: "VARIABLE",
    PL004: "FIXED",
    PL005: "FIXED",
    PL006: "FIXED",
    PL008: "FIXED",
    PL010: "FIXED",
    PL011: "FIXED",
    PL012: "FIXED",
    PL013: "FIXED",
    PL014: "FIXED",
    PL015: "VARIABLE"
  });
  assert.equal(Object.hasOwn(STANDARD_COST_CLASSIFICATIONS, "PL009"), false);
  assert.match(COST_CLASSIFICATION_EXCLUSIONS.PL009, /PL008の内数/);
});

