import * as calculator from "../calculators/sales.js";
import {
  addEngineWarning,
  createEngineResult,
  derivedInput,
  recordCalculation,
  recordResolvedValue
} from "./contract.js";
import { resolveInputs } from "./input-resolver.js";

export function runSalesEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    salesAmount: ["salesAmount", "PL001"],
    customerUnitPrice: ["customerUnitPrice", "MG006"],
    customerCount: ["customerCount", "MG005"],
    productUnitPrice: "productUnitPrice",
    salesQuantity: ["salesQuantity", "MG007"],
    requiredSalesAmount: ["requiredSalesAmount", "MG016"],
    businessDays: ["businessDays", "MG003"],
    employeeCount: ["employeeCount", "MG001"]
  });

  if (!input.salesAmount.missing) {
    recordResolvedValue(result, "salesAmount", input.salesAmount, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
    if (!input.customerUnitPrice.missing && !input.customerCount.missing) {
      const expected = calculator.calculateSalesFromCustomers(input.customerUnitPrice.value, input.customerCount.value);
      if (expected.value !== null && expected.value !== result.results.salesAmount) {
        addEngineWarning(result, "salesAmount", "salesAmount", "SALES_CUSTOMER_DETAIL_MISMATCH", "売上高と客単価×客数が一致しません。");
      }
    }
    if (!input.productUnitPrice.missing && !input.salesQuantity.missing) {
      const expected = calculator.calculateSalesFromQuantity(input.productUnitPrice.value, input.salesQuantity.value);
      if (expected.value !== null && expected.value !== result.results.salesAmount) {
        addEngineWarning(result, "salesAmount", "salesAmount", "SALES_QUANTITY_DETAIL_MISMATCH", "売上高と商品単価×販売数量が一致しません。");
      }
    }
  } else {
    const useCustomers = !input.customerUnitPrice.missing || !input.customerCount.missing;
    const calc = useCustomers
      ? calculator.calculateSalesFromCustomers(input.customerUnitPrice.value, input.customerCount.value)
      : calculator.calculateSalesFromQuantity(input.productUnitPrice.value, input.salesQuantity.value);
    recordCalculation(result, "salesAmount", calc, {
      formula: useCustomers ? "customerUnitPrice × customerCount" : "productUnitPrice × salesQuantity",
      rounding: "ROUND_YEN",
      inputs: useCustomers
        ? { customerUnitPrice: input.customerUnitPrice, customerCount: input.customerCount }
        : { productUnitPrice: input.productUnitPrice, salesQuantity: input.salesQuantity }
    });
  }

  const sales = derivedInput(result.results.salesAmount, "salesAmount");
  if (!input.customerUnitPrice.missing) {
    recordResolvedValue(result, "customerUnitPrice", input.customerUnitPrice, { rounding: "ROUND_YEN", validation: { nonNegative: true } });
  } else {
    recordCalculation(result, "customerUnitPrice", calculator.calculateCustomerUnitPrice(sales.value, input.customerCount.value), {
      formula: "salesAmount ÷ customerCount",
      rounding: "ROUND_YEN",
      inputs: { salesAmount: sales, customerCount: input.customerCount }
    });
  }
  recordCalculation(result, "requiredCustomerCount", calculator.calculateRequiredCustomerCount(input.requiredSalesAmount.value, (input.customerUnitPrice.missing ? derivedInput(result.results.customerUnitPrice, "customerUnitPrice") : input.customerUnitPrice).value), {
    formula: "ceil(requiredSalesAmount ÷ customerUnitPrice)",
    rounding: "CEIL_REQUIRED_QUANTITY",
    inputs: { requiredSalesAmount: input.requiredSalesAmount, customerUnitPrice: input.customerUnitPrice.missing ? derivedInput(result.results.customerUnitPrice, "customerUnitPrice") : input.customerUnitPrice }
  });
  recordCalculation(result, "requiredSalesQuantity", calculator.calculateRequiredSalesQuantity(input.requiredSalesAmount.value, input.productUnitPrice.value), {
    formula: "ceil(requiredSalesAmount ÷ productUnitPrice)",
    rounding: "CEIL_REQUIRED_QUANTITY",
    inputs: { requiredSalesAmount: input.requiredSalesAmount, productUnitPrice: input.productUnitPrice }
  });
  recordCalculation(result, "dailySales", calculator.calculateDailySales(sales.value, input.businessDays.value), {
    formula: "salesAmount ÷ businessDays",
    rounding: "ROUND_YEN",
    inputs: { salesAmount: sales, businessDays: input.businessDays }
  });
  recordCalculation(result, "salesPerEmployee", calculator.calculateSalesPerEmployee(sales.value, input.employeeCount.value), {
    formula: "salesAmount ÷ employeeCount",
    rounding: "ROUND_YEN",
    inputs: { salesAmount: sales, employeeCount: input.employeeCount }
  });
  return result;
}
