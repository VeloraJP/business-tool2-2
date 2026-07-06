import * as formula from "../formulas/financial-analysis.js";
import { calculateMonetaryNumbers, calculateNumbers } from "./validation.js";

export const calculateEquityRatio = (netAssets, totalAssets) => calculateNumbers(formula.equityRatio, { netAssets, totalAssets }, { totalAssets: { positive: true } });
export const calculateCurrentRatio = (currentAssets, currentLiabilities) => calculateNumbers(formula.currentRatio, { currentAssets, currentLiabilities }, { currentAssets: { nonNegative: true }, currentLiabilities: { positive: true } });
export const calculateFixedAssetRatio = (fixedAssets, netAssets) => calculateNumbers(formula.fixedAssetRatio, { fixedAssets, netAssets }, { fixedAssets: { nonNegative: true }, netAssets: { nonZero: true } });
export const calculateDebtRatio = (totalLiabilities, netAssets) => calculateNumbers(formula.debtRatio, { totalLiabilities, netAssets }, { totalLiabilities: { nonNegative: true }, netAssets: { nonZero: true } });
export const calculateReturnOnAssets = (netProfitAmount, endingTotalAssets) => calculateNumbers(formula.returnOnAssets, { netProfitAmount, endingTotalAssets }, { endingTotalAssets: { positive: true } });
export const calculateReturnOnEquity = (netProfitAmount, endingNetAssets) => calculateNumbers(formula.returnOnEquity, { netProfitAmount, endingNetAssets }, { endingNetAssets: { nonZero: true } });
export const calculateOperatingProfitMargin = (operatingProfitAmount, salesAmount) => calculateNumbers(formula.operatingProfitMargin, { operatingProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateOrdinaryProfitMargin = (ordinaryProfitAmount, salesAmount) => calculateNumbers(formula.ordinaryProfitMargin, { ordinaryProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateNetProfitMargin = (netProfitAmount, salesAmount) => calculateNumbers(formula.netProfitMargin, { netProfitAmount, salesAmount }, { salesAmount: { positive: true } });
export const calculateTotalAssetTurnover = (salesAmount, totalAssets) => calculateNumbers(formula.totalAssetTurnover, { salesAmount, totalAssets }, { salesAmount: { nonNegative: true }, totalAssets: { positive: true } });
export const calculateWorkingCapital = (currentAssets, currentLiabilities) => calculateMonetaryNumbers(formula.workingCapital, { currentAssets, currentLiabilities }, { currentAssets: { nonNegative: true }, currentLiabilities: { nonNegative: true } });
