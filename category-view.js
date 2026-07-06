import { ceilRequiredQuantity, ratio } from "./common.js";

export function salesAmountFromCustomers(customerUnitPrice, customerCount) {
  return customerUnitPrice * customerCount;
}

export function salesAmountFromQuantity(productUnitPrice, salesQuantity) {
  return productUnitPrice * salesQuantity;
}

export function customerUnitPrice(salesAmount, customerCount) {
  return ratio(salesAmount, customerCount);
}

export function requiredCustomerCount(requiredSalesAmount, unitPrice) {
  return ceilRequiredQuantity(ratio(requiredSalesAmount, unitPrice));
}

export function requiredSalesQuantity(requiredSalesAmount, productUnitPrice) {
  return ceilRequiredQuantity(ratio(requiredSalesAmount, productUnitPrice));
}

export function dailySales(salesAmount, businessDays) {
  return ratio(salesAmount, businessDays);
}

export function salesPerEmployee(salesAmount, employeeCount) {
  return ratio(salesAmount, employeeCount);
}
