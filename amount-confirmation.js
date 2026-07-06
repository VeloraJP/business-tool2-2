import * as formula from "../formulas/sales.js";
import { calculateMonetaryNumbers, calculateNumbers } from "./validation.js";

export const calculateSalesFromCustomers = (customerUnitPrice, customerCount) =>
  calculateMonetaryNumbers(formula.salesAmountFromCustomers, { customerUnitPrice, customerCount }, { customerUnitPrice: { nonNegative: true }, customerCount: { integer: true, nonNegative: true } });
export const calculateSalesFromQuantity = (productUnitPrice, salesQuantity) =>
  calculateMonetaryNumbers(formula.salesAmountFromQuantity, { productUnitPrice, salesQuantity }, { productUnitPrice: { nonNegative: true }, salesQuantity: { integer: true, nonNegative: true } });
export const calculateCustomerUnitPrice = (salesAmount, customerCount) =>
  calculateMonetaryNumbers(formula.customerUnitPrice, { salesAmount, customerCount }, { salesAmount: { nonNegative: true }, customerCount: { integer: true, positive: true } });
export const calculateRequiredCustomerCount = (requiredSalesAmount, unitPrice) =>
  calculateNumbers(formula.requiredCustomerCount, { requiredSalesAmount, unitPrice }, { requiredSalesAmount: { nonNegative: true }, unitPrice: { positive: true } });
export const calculateRequiredSalesQuantity = (requiredSalesAmount, productUnitPrice) =>
  calculateNumbers(formula.requiredSalesQuantity, { requiredSalesAmount, productUnitPrice }, { requiredSalesAmount: { nonNegative: true }, productUnitPrice: { positive: true } });
export const calculateDailySales = (salesAmount, businessDays) =>
  calculateMonetaryNumbers(formula.dailySales, { salesAmount, businessDays }, { salesAmount: { nonNegative: true }, businessDays: { integer: true, positive: true } });
export const calculateSalesPerEmployee = (salesAmount, employeeCount) =>
  calculateMonetaryNumbers(formula.salesPerEmployee, { salesAmount, employeeCount }, { salesAmount: { nonNegative: true }, employeeCount: { integer: true, positive: true } });
