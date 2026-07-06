import test from "node:test";
import assert from "node:assert/strict";
import { runFinancialAnalysisEngine } from "../../assets/js/engines/financial-analysis-engine.js";

test("財務分析Engineは11指標を期末残高方式で返す", () => {
  const result = runFinancialAnalysisEngine({ screenManual: { salesAmount: 150, operatingProfit: 12, ordinaryProfit: 11, netProfit: 10, currentAssets: 80, fixedAssets: 60, totalAssets: 100, currentLiabilities: 40, fixedLiabilities: 20, totalLiabilities: 60, netAssets: 40, liabilitiesAndNetAssets: 100 }, periodConsistency: true });
  assert.equal(result.results.equityRatio, 0.4);
  assert.equal(result.results.returnOnAssets, 0.1);
  assert.equal(result.results.returnOnEquity, 0.25);
  assert.equal(result.results.workingCapital, 40);
  assert.deepEqual(result.calculationBasis.returnOnAssets.conditions, ["SAME_PERIOD", "ENDING_BALANCE_METHOD"]);
});

test("貸借不一致はWarningだが指標計算を継続する", () => {
  const result = runFinancialAnalysisEngine({ screenManual: { totalAssets: 100, liabilitiesAndNetAssets: 99, netAssets: 40 } });
  assert.equal(result.results.equityRatio, 0.4);
  assert.equal(result.warnings.some(({ code }) => code === "BALANCE_SHEET_MISMATCH"), true);
});

test("負の純資産で指標を計算し純資産0だけをErrorにする", () => {
  const negative = runFinancialAnalysisEngine({ screenManual: {
    netAssets: -20, fixedAssets: 100, totalLiabilities: 80, netProfit: 10,
    totalAssets: 100, currentAssets: 50, currentLiabilities: 20,
    operatingProfit: 10, ordinaryProfit: 10, salesAmount: 100
  } });
  assert.equal(negative.results.fixedAssetRatio, -5);
  assert.equal(negative.results.debtRatio, -4);
  assert.equal(negative.results.returnOnEquity, -0.5);

  const zero = runFinancialAnalysisEngine({ screenManual: { netAssets: 0, fixedAssets: 100, totalLiabilities: 80, netProfit: 10 } });
  assert.equal(zero.errors.some(({ code }) => code === "DIVISION_BY_ZERO"), true);
});
