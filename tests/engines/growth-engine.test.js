import test from "node:test";
import assert from "node:assert/strict";
import { runGrowthEngine } from "../../assets/js/engines/growth-engine.js";

test("成長率Engineは年次成長率とCAGRを返す", () => {
  const result = runGrowthEngine({ screenManual: { metric: "salesAmount", previousValue: 100, currentValue: 120, initialValue: 100, finalValue: 121, sourcePeriodEnd: "2024-03-31", targetPeriodEnd: "2026-03-31", periods: ["2024", "2026"] } });
  assert.equal(result.results.difference, 20);
  assert.equal(result.results.growthRate, 0.2);
  assert.ok(Math.abs(result.results.cagr - 0.1) < Number.EPSILON);
});

test("負成長をWarningにせず、CAGR条件不成立をErrorにする", () => {
  const result = runGrowthEngine({ screenManual: { previousValue: 100, currentValue: 80, initialValue: 0, finalValue: 80, sourcePeriodEnd: "2024-03-31", targetPeriodEnd: "2026-03-31" } });
  assert.equal(result.results.growthRate, -0.2);
  assert.equal(result.warnings.length, 0);
  assert.equal(result.errors.some(({ resultName }) => resultName === "cagr"), true);
});

test("metricとperiodsの型を検証するが対象指標の限定は行わない", () => {
  const invalid = runGrowthEngine({ screenManual: { metric: 123, periods: "2025-2026" } });
  assert.equal(invalid.results.metric, null);
  assert.equal(invalid.results.periods, null);
  assert.equal(invalid.errors.filter(({ code }) => code === "INVALID_TYPE").length, 2);

  const scopeDeferred = runGrowthEngine({ screenManual: { metric: "customerCount", periods: ["2025", "2026"] } });
  assert.equal(scopeDeferred.results.metric, "customerCount");
  assert.equal(scopeDeferred.errors.some(({ resultName }) => resultName === "metric"), false);
});
