import assert from "node:assert/strict";
import test from "node:test";
import { createPeriod, createPersistentData } from "../../assets/js/data/schema.js";
import { validatePersistentData } from "../../assets/js/storage/validator.js";
import { createValidData, FIXED_NOW } from "../fixtures/company-data.js";
import {
  createDataWithFourPeriods,
  createDataWithInvalidMode
} from "../fixtures/invalid-company-data.js";

function errorCodes(result) {
  return result.errors.map(({ code }) => code);
}

test("初期データと正常な1期データを受理する", () => {
  assert.equal(
    validatePersistentData(createPersistentData({ now: () => FIXED_NOW })).valid,
    true
  );
  assert.equal(validatePersistentData(createValidData()).valid, true);
});

test("0を入力済みとして受理し、許可されたマイナスを受理する", () => {
  const data = createValidData();
  const result = validatePersistentData(data);

  assert.equal(result.valid, true);
  assert.equal(data.companyData.periods[0].pl.PL001, 0);
  assert.equal(data.companyData.periods[0].pl.PL003.value, -10);
  assert.equal(data.companyData.periods[0].bs.BS026.value, -50);
});

test("売上高や人数のマイナス値を拒否する", () => {
  const data = createValidData();
  data.companyData.periods[0].pl.PL001 = -1;
  data.companyData.managementInfo.MG001 = -1;

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.equal(
    result.errors.filter(({ code }) => code === "NEGATIVE_NOT_ALLOWED").length,
    2
  );
});

test("最大3期を超えるデータを拒否する", () => {
  const result = validatePersistentData(createDataWithFourPeriods());
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("MAX_PERIODS"));
});

test("periodId重複、不正日付、逆転期間を拒否する", () => {
  const data = createValidData();
  const duplicate = structuredClone(data.companyData.periods[0]);
  duplicate.startDate = "2026-02-30";
  duplicate.endDate = "2025-01-01";
  data.companyData.periods.push(duplicate);

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("DUPLICATE_PERIOD_ID"));
  assert.ok(errorCodes(result).includes("DATE"));
});

test("不正modeと不正税区分を拒否する", () => {
  const data = createDataWithInvalidMode();
  data.companyData.taxAccountingBasis = "AUTO";

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("MODE"));
  assert.ok(errorCodes(result).includes("TAX_ACCOUNTING_BASIS"));
});

test("整数項目の小数と未知項目を拒否する", () => {
  const data = createValidData();
  data.companyData.managementInfo.MG001 = 1.5;
  data.companyData.futureForecast = {};

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("INTEGER"));
  assert.ok(errorCodes(result).includes("UNKNOWN_KEY"));
});

test("Ver1.0で未定義のmetadata項目を拒否する", () => {
  const data = createValidData();
  data.metadata.accuracy = 5;

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("UNKNOWN_KEY"));
});

test("schemaVersion、appVersion、日時を検証する", () => {
  const data = createValidData();
  data.schemaVersion = "2.0";
  data.appVersion = "1.1";
  data.createdAt = "2026/07/01";

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("SCHEMA_VERSION"));
  assert.ok(errorCodes(result).includes("APP_VERSION"));
  assert.ok(errorCodes(result).includes("DATETIME"));
});

test("存在しない日付を含むISO日時を拒否する", () => {
  const data = createValidData();
  data.updatedAt = "2026-02-30T00:00:00Z";

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("DATETIME"));
});

test("AUTO項目の構造欠落を拒否する", () => {
  const data = createValidData();
  data.companyData.periods[0].pl.PL003 = { value: 10 };

  const result = validatePersistentData(data);
  assert.equal(result.valid, false);
  assert.ok(errorCodes(result).includes("REQUIRED"));
});

test("有効な3期を受理する", () => {
  const data = createPersistentData({ now: () => FIXED_NOW });

  for (let index = 0; index < 3; index += 1) {
    data.companyData.periods.push(createPeriod({
      periodId: `FY${index + 1}`,
      startDate: `${2023 + index}-04-01`,
      endDate: `${2024 + index}-03-31`,
      displayName: `${2024 + index}年3月期`
    }));
  }

  assert.equal(validatePersistentData(data).valid, true);
});
