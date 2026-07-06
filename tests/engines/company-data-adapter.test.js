import test from "node:test";
import assert from "node:assert/strict";
import { createPeriod, createPersistentData } from "../../assets/js/data/schema.js";
import {
  COMPANY_DATA_ADAPTER_CODES,
  adaptCompanyDataToEngineContext
} from "../../assets/js/engines/company-data-adapter.js";

function companyDataFixture() {
  const persistent = createPersistentData({ now: () => "2026-07-02T00:00:00.000Z" });
  const period = createPeriod({
    periodId: "FY2025",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    displayName: "2026年3月期"
  });
  period.pl.PL001 = 0;
  period.pl.PL003 = { value: 600, mode: "MANUAL" };
  period.bs.BS005 = { value: 1_000, mode: "AUTO" };
  persistent.companyData.taxAccountingBasis = "TAX_EXCLUDED";
  persistent.companyData.managementInfo.MG001 = 4;
  persistent.companyData.periods.push(period);
  return persistent.companyData;
}

test("共通データを対象期とmodeに従ってEngine候補へ変換する", () => {
  const companyData = companyDataFixture();
  const original = structuredClone(companyData);
  const context = adaptCompanyDataToEngineContext(companyData, {
    periodId: "FY2025",
    screenManual: { PL001: 10 }
  });

  assert.deepEqual(context.adapterErrors, []);
  assert.equal(context.screenManual.PL001, 10);
  assert.equal(context.derived.PL001, 0);
  assert.equal(context.savedManual.PL003.value, 600);
  assert.equal(context.savedManual.PL003.mode, "MANUAL");
  assert.equal(context.savedAuto.BS005.value, 1_000);
  assert.equal(context.savedAuto.BS005.mode, "AUTO");
  assert.equal(context.derived.MG001, 4);
  assert.equal(context.derived.CM001, "TAX_EXCLUDED");
  assert.equal(context.derived.CM002, "YEN");
  assert.deepEqual(companyData, original);
});

test("対象期不足・重複・不正modeを検出する", () => {
  const companyData = companyDataFixture();
  assert.equal(
    adaptCompanyDataToEngineContext(companyData).adapterErrors[0].code,
    COMPANY_DATA_ADAPTER_CODES.PERIOD_REQUIRED
  );
  assert.equal(
    adaptCompanyDataToEngineContext(companyData, { periodId: "UNKNOWN" }).adapterErrors[0].code,
    COMPANY_DATA_ADAPTER_CODES.PERIOD_NOT_FOUND
  );

  companyData.periods.push(structuredClone(companyData.periods[0]));
  assert.equal(
    adaptCompanyDataToEngineContext(companyData, { periodId: "FY2025" }).adapterErrors[0].code,
    COMPANY_DATA_ADAPTER_CODES.PERIOD_NOT_UNIQUE
  );

  companyData.periods.pop();
  companyData.periods[0].pl.PL003.mode = "UNKNOWN";
  assert.equal(
    adaptCompanyDataToEngineContext(companyData, { periodId: "FY2025" }).adapterErrors[0].code,
    COMPANY_DATA_ADAPTER_CODES.INVALID_MODE
  );
});
