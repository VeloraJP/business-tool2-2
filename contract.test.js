import assert from "node:assert/strict";
import test from "node:test";
import {
  createPeriod,
  createPersistentData,
  resetPersistentData
} from "../../assets/js/data/schema.js";
import { FIXED_NOW } from "../fixtures/company-data.js";

test("初期スキーマは税区分未選択・円入力・円表示である", () => {
  const data = createPersistentData({ now: () => FIXED_NOW });

  assert.equal(data.schemaVersion, "1.0");
  assert.equal(data.appVersion, "1.0");
  assert.equal(data.createdAt, FIXED_NOW);
  assert.equal(data.updatedAt, FIXED_NOW);
  assert.equal(data.companyData.taxAccountingBasis, null);
  assert.equal(data.companyData.amountInputUnit, "YEN");
  assert.deepEqual(data.companyData.periods, []);
  assert.equal(data.settings.amountDisplayUnit, "yen");
  assert.deepEqual(data.metadata, {});
  assert.equal(Object.keys(data.companyData.managementInfo).length, 16);
  assert.ok(Object.values(data.companyData.managementInfo).every((value) => value === null));
});

test("期データは正式PL・BS項目とAUTO状態を持つ", () => {
  const period = createPeriod({
    periodId: "FY2025",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    displayName: "2026年3月期"
  });

  assert.equal(Object.keys(period.pl).length, 25);
  assert.equal(Object.keys(period.bs).length, 27);
  assert.deepEqual(period.pl.PL003, { value: null, mode: "AUTO" });
  assert.deepEqual(period.bs.BS005, { value: null, mode: "AUTO" });
  assert.equal(period.pl.PL001, null);
  assert.equal(period.bs.BS001, null);
});

test("初期化は表示単位・バージョン・作成日時を保持する", () => {
  const data = createPersistentData({ now: () => FIXED_NOW });
  data.settings.amountDisplayUnit = "tenThousandYen";
  data.companyData.periods.push(createPeriod({
    periodId: "FY2025",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    displayName: "2026年3月期"
  }));

  const reset = resetPersistentData(data, {
    now: () => "2026-07-02T00:00:00.000Z"
  });

  assert.equal(reset.schemaVersion, "1.0");
  assert.equal(reset.appVersion, "1.0");
  assert.equal(reset.createdAt, FIXED_NOW);
  assert.equal(reset.updatedAt, "2026-07-02T00:00:00.000Z");
  assert.equal(reset.settings.amountDisplayUnit, "tenThousandYen");
  assert.deepEqual(reset.companyData.periods, []);
  assert.equal(reset.companyData.taxAccountingBasis, null);
});

