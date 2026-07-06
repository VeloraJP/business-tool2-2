import * as calculator from "../calculators/financial-analysis.js";
import { addEngineWarning, createEngineResult, recordCalculation } from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runFinancialAnalysisEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    salesAmount: ["salesAmount", "PL001"], operatingProfit: ["operatingProfit", "PL017"], ordinaryProfit: ["ordinaryProfit", "PL020"], netProfit: ["netProfit", "PL025"],
    currentAssets: ["currentAssets", "BS005"], fixedAssets: ["fixedAssets", "BS011"], totalAssets: ["totalAssets", "BS012"],
    currentLiabilities: ["currentLiabilities", "BS018"], fixedLiabilities: ["fixedLiabilities", "BS021"], totalLiabilities: ["totalLiabilities", "BS022"], netAssets: ["netAssets", "BS026"], liabilitiesAndNetAssets: ["liabilitiesAndNetAssets", "BS027"]
  });
  const definitions = [
    ["equityRatio", calculator.calculateEquityRatio, [input.netAssets, input.totalAssets], "netAssets ÷ totalAssets"],
    ["currentRatio", calculator.calculateCurrentRatio, [input.currentAssets, input.currentLiabilities], "currentAssets ÷ currentLiabilities"],
    ["fixedAssetRatio", calculator.calculateFixedAssetRatio, [input.fixedAssets, input.netAssets], "fixedAssets ÷ netAssets"],
    ["debtRatio", calculator.calculateDebtRatio, [input.totalLiabilities, input.netAssets], "totalLiabilities ÷ netAssets"],
    ["returnOnAssets", calculator.calculateReturnOnAssets, [input.netProfit, input.totalAssets], "netProfit ÷ endingTotalAssets"],
    ["returnOnEquity", calculator.calculateReturnOnEquity, [input.netProfit, input.netAssets], "netProfit ÷ endingNetAssets"],
    ["operatingProfitMargin", calculator.calculateOperatingProfitMargin, [input.operatingProfit, input.salesAmount], "operatingProfit ÷ salesAmount"],
    ["ordinaryProfitMargin", calculator.calculateOrdinaryProfitMargin, [input.ordinaryProfit, input.salesAmount], "ordinaryProfit ÷ salesAmount"],
    ["netProfitMargin", calculator.calculateNetProfitMargin, [input.netProfit, input.salesAmount], "netProfit ÷ salesAmount"],
    ["totalAssetTurnover", calculator.calculateTotalAssetTurnover, [input.salesAmount, input.totalAssets], "salesAmount ÷ totalAssets"],
    ["workingCapital", calculator.calculateWorkingCapital, [input.currentAssets, input.currentLiabilities], "currentAssets - currentLiabilities", "ROUND_YEN"]
  ];
  for (const [name, calculate, args, formula, rounding = "NONE"] of definitions) {
    const inputMap = Object.fromEntries(args.map((item) => [item.field, item]));
    recordCalculation(result, name, calculate(...args.map(({ value }) => value)), { formula, rounding, inputs: inputMap, conditions: ["SAME_PERIOD", ...(name === "returnOnAssets" || name === "returnOnEquity" ? ["ENDING_BALANCE_METHOD"] : [])] });
  }
  if (!input.totalAssets.missing && !input.liabilitiesAndNetAssets.missing && input.totalAssets.value !== input.liabilitiesAndNetAssets.value) {
    addEngineWarning(result, "balanceSheet", "BS012", "BALANCE_SHEET_MISMATCH", "資産合計と負債純資産合計が一致しません。");
  }
  if (context.periodConsistency === false) addEngineWarning(result, "periods", "periodId", "PERIOD_MISMATCH", "PLとBSの対象期が一致しません。");
  return result;
}
