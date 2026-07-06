import test from "node:test";
import assert from "node:assert/strict";
import { CompanyDataController } from "../../assets/js/controllers/company-data-controller.js";
import { CompanyDataIOController } from "../../assets/js/controllers/company-data-io-controller.js";
import { LocalStorageRepository } from "../../assets/js/storage/repository.js";
import { CompanyDataStore } from "../../assets/js/state/store.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

test("JSON import成功後にRepositoryと画面draftを同期する", () => {
  const storage = new MemoryStorage();
  const repository = new LocalStorageRepository({ storage, now: () => "2026-07-02T00:00:00.000Z" });
  const store = new CompanyDataStore({ repository, storage, now: () => "2026-07-02T00:00:00.000Z" });
  store.initialize();
  const controller = new CompanyDataController({ store });
  const io = new CompanyDataIOController({ store, companyController: controller });
  const source = store.getPersistentSnapshot();
  source.companyData.taxAccountingBasis = "TAX_INCLUDED";
  io.importJson(JSON.stringify(source));
  assert.equal(controller.state.draft.companyData.taxAccountingBasis, "TAX_INCLUDED");
  assert.equal(JSON.parse(storage.getItem("managementAnalysis.ver1")).companyData.taxAccountingBasis, "TAX_INCLUDED");
});
