import * as calculator from "../calculators/pricing.js";
import { appendValidation, createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { resolveContextList, resolveInputs } from "./input-resolver.js";
import { validateSameTaxBasis, validateSameUnit } from "../calculators/unit.js";

export function runPricingEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    currentPrice: "currentPrice", changedPrice: "changedPrice", reducedPrice: "reducedPrice", unitCost: "unitCost",
    changedUnitCost: "changedUnitCost", currentUnitCost: ["currentUnitCost", "unitCost"], salesQuantity: ["salesQuantity", "MG007"],
    expectedQuantityAfterPriceChange: "expectedQuantityAfterPriceChange",
    fixedCostsExcludingLabor: "fixedCostsExcludingLabor", laborCosts: ["laborCosts", "PL007"], otherVariableCosts: ["otherVariableCosts", "PL015"],
    targetOperatingProfit: ["targetOperatingProfit", "MG015"]
  });
  recordResolvedValue(result, "expectedQuantityAfterPriceChange", input.expectedQuantityAfterPriceChange, { validation: { type: "number", integer: true, positive: true } });
  recordResolvedValue(result, "unitCostAfterPriceChange", input.changedUnitCost, { rounding: "ROUND_YEN", validation: { type: "number", nonNegative: true } });
  recordCalculation(result, "currentGrossProfit", calculator.calculateCurrentGrossProfit(input.currentPrice.value, input.currentUnitCost.value, input.salesQuantity.value), { formula: "(currentPrice - currentUnitCost) × salesQuantity", rounding: "ROUND_YEN", inputs: { currentPrice: input.currentPrice, currentUnitCost: input.currentUnitCost, salesQuantity: input.salesQuantity } });
  recordCalculation(result, "grossProfitAfterPriceChange", calculator.calculateGrossProfitAfterPriceChange(input.changedPrice.value, input.changedUnitCost.value, input.expectedQuantityAfterPriceChange.value), { formula: "(changedPrice - changedUnitCost) × expectedQuantityAfterPriceChange", rounding: "ROUND_YEN", inputs: { changedPrice: input.changedPrice, changedUnitCost: input.changedUnitCost, expectedQuantityAfterPriceChange: input.expectedQuantityAfterPriceChange } });
  const currentGross = derivedInput(result.results.currentGrossProfit, "currentGrossProfit");
  recordCalculation(result, "requiredQuantity", calculator.calculateRequiredQuantityAfterPriceReduction(currentGross.value, input.reducedPrice.value, input.changedUnitCost.value), { formula: "ceil(currentGrossProfit ÷ (reducedPrice - changedUnitCost))", rounding: "CEIL_REQUIRED_QUANTITY", inputs: { currentGrossProfit: currentGross, reducedPrice: input.reducedPrice, changedUnitCost: input.changedUnitCost } });
  recordCalculation(result, "grossProfitMaintenancePrice", calculator.calculateGrossProfitMaintenancePrice(input.changedUnitCost.value, input.currentPrice.value, input.currentUnitCost.value), { formula: "changedUnitCost + (currentPrice - currentUnitCost)", rounding: "ROUND_YEN", inputs: { changedUnitCost: input.changedUnitCost, currentPrice: input.currentPrice, currentUnitCost: input.currentUnitCost } });
  const targetInputs = { unitCost: input.currentUnitCost.value, salesQuantity: input.salesQuantity.value, fixedCostsExcludingLabor: input.fixedCostsExcludingLabor.value, laborCosts: input.laborCosts.value, otherVariableCosts: input.otherVariableCosts.value, targetOperatingProfit: input.targetOperatingProfit.value };
  recordCalculation(result, "requiredPriceForTargetOperatingProfit", calculator.calculateRequiredPriceForTargetOperatingProfit(targetInputs), { formula: "(currentUnitCost×salesQuantity + fixedCostsExcludingLabor + laborCosts + otherVariableCosts + targetOperatingProfit) ÷ salesQuantity", rounding: "ROUND_YEN", inputs: { currentUnitCost: input.currentUnitCost, salesQuantity: input.salesQuantity, fixedCostsExcludingLabor: input.fixedCostsExcludingLabor, laborCosts: input.laborCosts, otherVariableCosts: input.otherVariableCosts, targetOperatingProfit: input.targetOperatingProfit } });
  const taxBases = resolveContextList(context, "taxBases", "taxAccountingBasis");
  const units = resolveContextList(context, "units", "amountInputUnit");
  appendValidation(result, "taxAccountingBasis", validateSameTaxBasis(...taxBases));
  appendValidation(result, "amountInputUnit", validateSameUnit(...units));
  return result;
}
