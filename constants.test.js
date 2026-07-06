import test from "node:test";
import assert from "node:assert/strict";
import { CategoryAnalysisController } from "../../assets/js/controllers/category-analysis-controller.js";
import { CATEGORIES } from "../../assets/js/config/categories.js";
import { createPeriod, createPersistentData } from "../../assets/js/data/schema.js";

function setValue(collection, field, value) {
  if (collection[field] && typeof collection[field] === "object") collection[field].value = value;
  else collection[field] = value;
}

function period(id, year, factor) {
  const data = createPeriod({ periodId: id, startDate: `${year}-04-01`, endDate: `${year + 1}-03-31`, displayName: `${year + 1}年3月期` });
  const values = {
    PL001: 10000000 * factor, PL002: 4000000 * factor, PL004: 300000, PL005: 1200000, PL006: 300000,
    PL008: 600000, PL010: 200000, PL011: 100000, PL012: 100000, PL013: 100000, PL014: 200000, PL015: 300000,
    PL018: 50000, PL019: 20000, PL021: 0, PL022: 0, PL024: 600000
  };
  for (const [field, value] of Object.entries(values)) setValue(data.pl, field, value);
  for (const [field, value] of Object.entries({ BS001: 2000000, BS005: 4000000, BS011: 6000000, BS012: 10000000, BS018: 2000000, BS021: 3000000, BS022: 5000000, BS026: 5000000, BS027: 10000000 })) setValue(data.bs, field, value);
  return data;
}

function createStore() {
  const persistent = createPersistentData({ now: () => "2026-07-01T00:00:00.000Z" });
  persistent.companyData.taxAccountingBasis = "TAX_EXCLUDED";
  persistent.companyData.amountInputUnit = "YEN";
  persistent.companyData.periods.push(period("FY2024", 2023, 0.9), period("FY2025", 2024, 1));
  persistent.companyData.managementInfo.MG001 = 5;
  persistent.companyData.managementInfo.MG003 = 240;
  persistent.companyData.managementInfo.MG005 = 1000;
  persistent.companyData.managementInfo.MG006 = 10000;
  persistent.companyData.managementInfo.MG007 = 500;
  persistent.companyData.managementInfo.MG015 = 3000000;
  persistent.companyData.managementInfo.MG016 = 12000000;
  return {
    persistent,
    getPersistentSnapshot() { return structuredClone(this.persistent); }
  };
}

test("8カテゴリは既存Engine共通契約へ接続する", () => {
  const controller = new CategoryAnalysisController({ store: createStore() });
  for (const category of CATEGORIES) {
    const model = controller.analyze(category.id);
    assert.equal(model.definition.id, category.id);
    assert.ok(Object.keys(model.engineResults).length > 0, category.id);
    for (const result of Object.values(model.engineResults)) {
      assert.deepEqual(Object.keys(result), ["results", "errors", "warnings", "missingFields", "calculationBasis", "usedInputs", "inputSources"]);
    }
  }
});

test("簡易入力は会社データへ保存せず金額単位をFacade経由で円へ変換する", () => {
  const store = createStore();
  store.persistent.companyData.amountInputUnit = "THOUSAND_YEN";
  const before = JSON.stringify(store.persistent);
  const controller = new CategoryAnalysisController({ store });
  controller.setInput("investment", "investmentAmount", "100");
  controller.setInput("investment", "annualOperatingProfitAfterInvestment", "25");
  controller.setInput("investment", "annualRunningCost", "5");
  const model = controller.viewModel("investment");
  assert.equal(model.engineResults["investment-return"].results.investmentAmount, 100000);
  assert.equal(model.engineResults["investment-return"].results.operatingProfitAfterRunningCost, 20000);
  assert.equal(JSON.stringify(store.persistent), before);
});

test("目標カテゴリは目標営業利益を使用しtax Engineと逆算処理を呼ばない", () => {
  const controller = new CategoryAnalysisController({ store: createStore() });
  controller.setInput("target", "targetOperatingProfit", "3000000");
  const results = controller.viewModel("target").engineResults;
  assert.ok(results["break-even"]);
  assert.ok(results.sales);
  assert.ok(results.pricing);
  assert.equal(results.tax, undefined);
});

test("画面入力の売上内訳矛盾をWarningとして表示契約へ渡す", () => {
  const controller = new CategoryAnalysisController({ store: createStore() });
  controller.setInput("operating-profit", "salesAmount", "1000");
  controller.setInput("operating-profit", "customerUnitPrice", "100");
  controller.setInput("operating-profit", "customerCount", "5");
  const warnings = controller.viewModel("operating-profit").messages.warnings;
  assert.ok(warnings.some(({ code }) => code === "SALES_CUSTOMER_DETAIL_MISMATCH"));
});
