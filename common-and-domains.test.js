import test from "node:test";
import assert from "node:assert/strict";
import { runProfitEngine } from "../../assets/js/engines/profit-engine.js";

test("利益区分EngineはPL009を加算せず各利益区分を計算する", () => {
  const result = runProfitEngine({ screenManual: { salesAmount: 1_000, costOfSales: 400, executiveCompensation: 50, salaries: 100, statutoryBenefits: 20, rent: 30, utilities: 10, advertising: 10, fees: 10, depreciation: 10, otherFixedCosts: 20, otherVariableCosts: 40, nonOperatingIncome: 10, nonOperatingExpenses: 5, extraordinaryIncome: 2, extraordinaryLoss: 1, corporateTax: 100 } });
  assert.equal(result.results.grossProfit, 600);
  assert.equal(result.results.laborCostTotal, 170);
  assert.equal(result.results.sgAndA, 300);
  assert.equal(result.results.operatingProfit, 300);
  assert.equal(result.results.ordinaryProfit, 305);
  assert.equal(result.results.incomeBeforeTax, 306);
  assert.equal(result.results.netProfit, 206);
});

test("保存MANUAL値をAUTO計算より優先し出典を残す", () => {
  const result = runProfitEngine({ savedManual: { PL003: 700 }, savedAuto: { PL003: 600 }, screenManual: { salesAmount: 1_000 } });
  assert.equal(result.results.grossProfit, 700);
  assert.equal(result.inputSources.grossProfit.grossProfit.type, "SAVED_MANUAL");
});

test("内訳差異はAUTOだけWarningとしMANUAL採用値は警告しない", () => {
  const inputs = { salesAmount: 1_000, costOfSales: 400 };
  const manual = runProfitEngine({ screenManual: { ...inputs, grossProfit: 700 } });
  assert.equal(manual.warnings.some(({ code }) => code === "AUTO_DETAIL_MISMATCH"), false);

  const auto = runProfitEngine({
    screenManual: inputs,
    savedAuto: { grossProfit: { value: 700, mode: "AUTO" } }
  });
  assert.equal(auto.warnings.some(({ code }) => code === "AUTO_DETAIL_MISMATCH"), true);
});

test("採用済み利益区分を項目別に検証し金額を丸める", () => {
  const result = runProfitEngine({ screenManual: { grossProfit: -10.5, laborCostTotal: -1 } });
  assert.equal(result.results.grossProfit, -11);
  assert.equal(result.results.laborCostTotal, null);
  assert.equal(result.errors.some(({ resultName, code }) => resultName === "laborCostTotal" && code === "NON_NEGATIVE_REQUIRED"), true);
});

test("保存候補とmodeの矛盾をEngineでErrorにする", () => {
  const result = runProfitEngine({ savedManual: { grossProfit: { value: 600, mode: "AUTO" } } });
  assert.equal(result.results.grossProfit, null);
  assert.equal(result.errors.some(({ resultName, code }) => resultName === "grossProfit" && code === "MODE_SOURCE_MISMATCH"), true);
});
