import * as formula from "../formulas/pricing.js";
import { roundYen } from "../formulas/common.js";
import { calculateMonetaryNumbers, calculateWithValidation, createValidationResult, validateNumber } from "./validation.js";

export const calculateCurrentGrossProfit = (currentPrice, unitCost, salesQuantity) => calculateMonetaryNumbers(formula.currentGrossProfit, { currentPrice, unitCost, salesQuantity }, { currentPrice: { nonNegative: true }, unitCost: { nonNegative: true }, salesQuantity: { integer: true, nonNegative: true } });
export const calculateGrossProfitAfterPriceChange = (changedPrice, changedUnitCost, expectedSalesQuantity) => calculateMonetaryNumbers(formula.grossProfitAfterPriceChange, { changedPrice, changedUnitCost, expectedSalesQuantity }, { changedPrice: { nonNegative: true }, changedUnitCost: { nonNegative: true }, expectedSalesQuantity: { integer: true, positive: true } });
export function calculateRequiredQuantityAfterPriceReduction(currentGrossProfitAmount, reducedPrice, unitCost) {
  const validation = createValidationResult();
  validateNumber(validation, "currentGrossProfitAmount", currentGrossProfitAmount, { nonNegative: true });
  validateNumber(validation, "reducedPrice", reducedPrice, { nonNegative: true });
  validateNumber(validation, "unitCost", unitCost, { nonNegative: true });
  if (typeof reducedPrice === "number" && typeof unitCost === "number" && reducedPrice - unitCost <= 0) {
    validation.errors.push({ field: "reducedPrice", code: "NON_POSITIVE_UNIT_GROSS_PROFIT", message: "値下げ後の1単位売上総利益は0より大きい必要があります。" });
  }
  return calculateWithValidation(validation, () => formula.requiredQuantityAfterPriceReduction(currentGrossProfitAmount, reducedPrice, unitCost));
}
export const calculateGrossProfitMaintenancePrice = (changedUnitCost, currentPrice, currentUnitCost) => calculateMonetaryNumbers(formula.grossProfitMaintenancePrice, { changedUnitCost, currentPrice, currentUnitCost }, { changedUnitCost: { nonNegative: true }, currentPrice: { nonNegative: true }, currentUnitCost: { nonNegative: true } });
export function calculateRequiredPriceForTargetOperatingProfit(input) {
  const validation = createValidationResult();
  validateNumber(validation, "targetOperatingProfit", input.targetOperatingProfit);
  validateNumber(validation, "unitCost", input.unitCost, { nonNegative: true });
  validateNumber(validation, "salesQuantity", input.salesQuantity, { integer: true, positive: true });
  validateNumber(validation, "fixedCostsExcludingLabor", input.fixedCostsExcludingLabor, { nonNegative: true });
  validateNumber(validation, "laborCosts", input.laborCosts, { nonNegative: true });
  validateNumber(validation, "otherVariableCosts", input.otherVariableCosts, { nonNegative: true });
  return calculateWithValidation(validation, () => roundYen(formula.requiredPriceForTargetOperatingProfit(input)));
}
