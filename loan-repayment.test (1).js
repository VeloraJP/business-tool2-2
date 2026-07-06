import test from "node:test";
import assert from "node:assert/strict";
import { runSalesEngine } from "../../assets/js/engines/sales-engine.js";

test("売上EngineはCalculator結果と根拠・出典を統合する", () => {
  const result = runSalesEngine({ screenManual: { customerUnitPrice: 2_000, customerCount: 5, productUnitPrice: 800, salesQuantity: 10, requiredSalesAmount: 10_001, businessDays: 20, employeeCount: 2 } });
  assert.equal(result.results.salesAmount, 10_000);
  assert.equal(result.results.requiredCustomerCount, 6);
  assert.equal(result.results.dailySales, 500);
  assert.equal(result.inputSources.salesAmount.customerUnitPrice.type, "SCREEN_MANUAL");
});

test("売上Engineは一部Errorでも売上高を返す", () => {
  const result = runSalesEngine({ screenManual: { salesAmount: 100, customerCount: 0 } });
  assert.equal(result.results.salesAmount, 100);
  assert.equal(result.results.customerUnitPrice, null);
  assert.equal(result.errors.some(({ resultName }) => resultName === "customerUnitPrice"), true);
});

test("採用売上高の負値・非数値を拒否し、小数金額を丸める", () => {
  const negative = runSalesEngine({ screenManual: { salesAmount: -1 } });
  assert.equal(negative.results.salesAmount, null);
  assert.equal(negative.errors.some(({ code }) => code === "NON_NEGATIVE_REQUIRED"), true);

  const text = runSalesEngine({ screenManual: { salesAmount: "100" } });
  assert.equal(text.results.salesAmount, null);
  assert.equal(text.errors.some(({ code }) => code === "INVALID_NUMBER"), true);

  const rounded = runSalesEngine({ screenManual: { salesAmount: 100.5 } });
  assert.equal(rounded.results.salesAmount, 101);
});
