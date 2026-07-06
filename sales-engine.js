import { runBreakEvenEngine } from "./break-even-engine.js";
import { runCashFlowEngine } from "./cash-flow-engine.js";
import { runComparisonEngine } from "./comparison-engine.js";
import { runFinancialAnalysisEngine } from "./financial-analysis-engine.js";
import { runGrowthEngine } from "./growth-engine.js";
import { runInvestmentReturnEngine } from "./investment-return-engine.js";
import { runLaborCostEngine } from "./labor-cost-engine.js";
import { runLoanRepaymentEngine } from "./loan-repayment-engine.js";
import { runPricingEngine } from "./pricing-engine.js";
import { runProfitEngine } from "./profit-engine.js";
import { runSalesEngine } from "./sales-engine.js";
import { runTaxEngine } from "./tax-engine.js";
import { createEngineResult } from "./contract.js";

export const ENGINE_IDS = Object.freeze({
  SALES: "sales",
  PROFIT: "profit",
  BREAK_EVEN: "break-even",
  PRICING: "pricing",
  LABOR_COST: "labor-cost",
  CASH_FLOW: "cash-flow",
  LOAN_REPAYMENT: "loan-repayment",
  INVESTMENT_RETURN: "investment-return",
  FINANCIAL_ANALYSIS: "financial-analysis",
  COMPARISON: "comparison",
  GROWTH: "growth",
  TAX: "tax"
});

const ENGINE_RUNNERS = Object.freeze({
  [ENGINE_IDS.SALES]: runSalesEngine,
  [ENGINE_IDS.PROFIT]: runProfitEngine,
  [ENGINE_IDS.BREAK_EVEN]: runBreakEvenEngine,
  [ENGINE_IDS.PRICING]: runPricingEngine,
  [ENGINE_IDS.LABOR_COST]: runLaborCostEngine,
  [ENGINE_IDS.CASH_FLOW]: runCashFlowEngine,
  [ENGINE_IDS.LOAN_REPAYMENT]: runLoanRepaymentEngine,
  [ENGINE_IDS.INVESTMENT_RETURN]: runInvestmentReturnEngine,
  [ENGINE_IDS.FINANCIAL_ANALYSIS]: runFinancialAnalysisEngine,
  [ENGINE_IDS.COMPARISON]: runComparisonEngine,
  [ENGINE_IDS.GROWTH]: runGrowthEngine,
  [ENGINE_IDS.TAX]: runTaxEngine
});

export function runEngine(engineId, context = {}) {
  const runner = ENGINE_RUNNERS[engineId];
  if (runner) return runner(context);
  const result = createEngineResult();
  result.errors.push({
    resultName: "engine",
    field: "engineId",
    code: "UNKNOWN_ENGINE",
    message: "指定されたEngineはVer1.0に存在しません。"
  });
  return result;
}
