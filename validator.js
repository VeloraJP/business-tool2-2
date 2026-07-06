import { ceilRequiredQuantity, ratio } from "./common.js";

export function currentGrossProfit(currentPrice, unitCost, salesQuantity) {
  return (currentPrice - unitCost) * salesQuantity;
}

export function grossProfitAfterPriceChange(
  changedPrice,
  changedUnitCost,
  expectedSalesQuantity
) {
  return (changedPrice - changedUnitCost) * expectedSalesQuantity;
}

export function requiredQuantityAfterPriceReduction(
  currentGrossProfitAmount,
  reducedPrice,
  unitCost
) {
  return ceilRequiredQuantity(
    ratio(currentGrossProfitAmount, reducedPrice - unitCost)
  );
}

export function grossProfitMaintenancePrice(
  changedUnitCost,
  currentPrice,
  currentUnitCost
) {
  return changedUnitCost + (currentPrice - currentUnitCost);
}

export function requiredPriceForTargetOperatingProfit({
  unitCost,
  salesQuantity,
  fixedCostsExcludingLabor,
  laborCosts,
  otherVariableCosts,
  targetOperatingProfit
}) {
  return ratio(
    unitCost * salesQuantity +
      fixedCostsExcludingLabor +
      laborCosts +
      otherVariableCosts +
      targetOperatingProfit,
    salesQuantity
  );
}
