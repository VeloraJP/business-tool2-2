import test from "node:test";
import assert from "node:assert/strict";
import { runLaborCostEngine } from "../../assets/js/engines/labor-cost-engine.js";

test("人件費Engineは標準社会保険料率と基準日を使用する", () => {
  const result = runLaborCostEngine({ screenManual: { executiveCompensation: 100, salaries: 300, statutoryBenefits: 50, salesAmount: 2_000, currentOperatingProfit: 500, expectedSalaryPerPerson: 300, plannedHireCount: 2, expectedAdditionalSales: 0, marginalProfitRate: 0.5, employeeCount: 4 } });
  assert.equal(result.results.socialInsuranceEstimate, 90);
  assert.equal(result.results.additionalLaborCost, 690);
  assert.equal(result.results.operatingProfitAfterHiring, -190);
  assert.equal(result.usedInputs.socialInsuranceEstimate.rateBaseDate, "2026-07-01");
});

test("人件費内訳差異はAUTOだけWarningとする", () => {
  const details = { executiveCompensation: 100, salaries: 300, statutoryBenefits: 50 };
  const manual = runLaborCostEngine({ screenManual: { ...details, currentLaborCosts: 999 } });
  assert.equal(manual.warnings.some(({ code }) => code === "LABOR_DETAIL_MISMATCH"), false);

  const auto = runLaborCostEngine({
    screenManual: details,
    savedAuto: { currentLaborCosts: { value: 999, mode: "AUTO" } }
  });
  assert.equal(auto.warnings.some(({ code }) => code === "LABOR_DETAIL_MISMATCH"), true);
});
