import test from "node:test";
import assert from "node:assert/strict";
import { calculateBalanceSheetAutoValues } from "../../assets/js/calculators/balance-sheet-auto.js";

function completeBs() {
  return {
    BS001: 10, BS002: 20, BS003: 30, BS004: 40,
    BS005: { value: null, mode: "AUTO" },
    BS006: 10, BS007: 20, BS008: 30, BS009: 40, BS010: 50,
    BS011: { value: null, mode: "AUTO" }, BS012: { value: null, mode: "AUTO" },
    BS013: 10, BS014: 20, BS015: 30, BS016: 40, BS017: 50,
    BS018: { value: null, mode: "AUTO" }, BS019: 60, BS020: 40,
    BS021: { value: null, mode: "AUTO" }, BS022: { value: null, mode: "AUTO" },
    BS023: 100, BS024: -20, BS025: 20,
    BS026: { value: null, mode: "AUTO" }, BS027: { value: null, mode: "AUTO" }
  };
}

test("BS AUTO専用Calculatorは凍結仕様の8項目だけを計算する", () => {
  const result = calculateBalanceSheetAutoValues(completeBs());
  assert.deepEqual(result.results, {
    BS005: 100, BS011: 150, BS012: 250, BS018: 150,
    BS021: 100, BS022: 250, BS026: 100, BS027: 350
  });
  assert.equal(result.errors.length, 0);
  assert.equal(result.missingFields.length, 0);
});

test("MANUAL中間合計を下流AUTOが採用し、不足項目は独立表示する", () => {
  const bs = completeBs();
  bs.BS005 = { value: 999, mode: "MANUAL" };
  bs.BS001 = null;
  const result = calculateBalanceSheetAutoValues(bs);
  assert.equal(result.results.BS005, null);
  assert.equal(result.results.BS012, 1_149);
  assert.equal(result.missingFields.some(({ resultName, field }) => resultName === "BS005" && field === "BS001"), true);
});
