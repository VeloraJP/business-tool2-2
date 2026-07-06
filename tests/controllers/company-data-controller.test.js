import test from "node:test";
import assert from "node:assert/strict";
import { CompanyDataController } from "../../assets/js/controllers/company-data-controller.js";
import { LocalStorageRepository } from "../../assets/js/storage/repository.js";
import { CompanyDataStore } from "../../assets/js/state/store.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

function setup() {
  const storage = new MemoryStorage();
  const repository = new LocalStorageRepository({ storage, now: () => "2026-07-02T00:00:00.000Z" });
  const store = new CompanyDataStore({ repository, storage, now: () => "2026-07-02T00:00:00.000Z" });
  store.initialize();
  return { storage, store, controller: new CompanyDataController({ store }) };
}

test("ControllerはUnit Facade経由で入力単位を円へ変換しPL AUTOを更新する", () => {
  const { controller } = setup();
  controller.setCommon("amountInputUnit", "THOUSAND_YEN");
  controller.setField("pl", "PL001", "100");
  controller.setField("pl", "PL002", "40");
  const period = controller.state.currentPeriod();
  assert.equal(period.pl.PL001, 100_000);
  assert.equal(period.pl.PL002, 40_000);
  assert.equal(period.pl.PL003.value, 60_000);
});

test("ControllerはBS AUTO8項目を更新し貸借不一致をWarningにする", () => {
  const { controller } = setup();
  for (const field of ["BS001", "BS002", "BS003", "BS004"]) controller.setField("bs", field, "10");
  for (const field of ["BS006", "BS007", "BS008", "BS009", "BS010"]) controller.setField("bs", field, "10");
  for (const field of ["BS013", "BS014", "BS015", "BS016", "BS017", "BS019", "BS020", "BS023", "BS024", "BS025"]) controller.setField("bs", field, "10");
  const bs = controller.state.currentPeriod().bs;
  assert.equal(bs.BS005.value, 40);
  assert.equal(bs.BS011.value, 50);
  assert.equal(bs.BS012.value, 90);
  assert.equal(bs.BS027.value, 100);
  assert.equal(controller.state.messages.warnings.some(({ code }) => code === "BALANCE_SHEET_MISMATCH"), true);
});

test("BS012とBS027のMANUAL不一致だけでもWarningを返す", () => {
  const { controller } = setup();
  controller.setMode("bs", "BS012", "MANUAL");
  controller.setMode("bs", "BS027", "MANUAL");
  controller.setField("bs", "BS012", "100");
  controller.setField("bs", "BS027", "200");
  assert.equal(controller.state.messages.warnings.some(({ code }) => code === "BALANCE_SHEET_MISMATCH"), true);
});

test("税区分未選択をErrorとし、確定後はRepositoryへ保存する", () => {
  const { controller, storage } = setup();
  controller.setPeriodMeta("startDate", "2026-01-01");
  controller.setPeriodMeta("endDate", "2026-12-31");
  controller.setPeriodMeta("displayName", "2026年度");
  assert.equal(controller.save().ok, false);
  assert.equal(controller.state.messages.errors[0].field, "taxAccountingBasis");
  controller.setCommon("taxAccountingBasis", "TAX_EXCLUDED");
  assert.equal(controller.save().ok, true);
  assert.notEqual(storage.getItem("managementAnalysis.ver1"), null);
});
