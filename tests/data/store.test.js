import assert from "node:assert/strict";
import test from "node:test";
import { STORAGE_KEYS } from "../../assets/js/config/constants.js";
import { LocalStorageRepository } from "../../assets/js/storage/repository.js";
import { CompanyDataStore } from "../../assets/js/state/store.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

const NOW = "2026-07-01T00:00:00.000Z";

function createStore(storage) {
  const repository = new LocalStorageRepository({
    storage,
    now: () => NOW
  });
  return new CompanyDataStore({
    repository,
    storage,
    now: () => NOW
  });
}

test("新規利用時は初期データをメモリに作り自動保存しない", () => {
  const storage = new MemoryStorage();
  const store = createStore(storage);
  const startup = store.initialize();

  assert.equal(startup.legacyState, "EMPTY");
  assert.equal(startup.repositoryStatus, "EMPTY");
  assert.equal(startup.data.companyData.taxAccountingBasis, null);
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), null);
});

test("旧版のみ存在する場合は正式データを作らない", () => {
  const storage = new MemoryStorage({ [STORAGE_KEYS.LEGACY]: "legacy" });
  const store = createStore(storage);
  const startup = store.initialize();

  assert.equal(startup.legacyState, "LEGACY_REQUIRES_CONFIRMATION");
  assert.equal(startup.data, null);
  assert.equal(storage.getItem(STORAGE_KEYS.LEGACY), "legacy");
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), null);
});

test("セッション状態を正式データへ保存しない", () => {
  const storage = new MemoryStorage();
  const store = createStore(storage);
  store.initialize();
  store.setSessionValue("temporaryInputs", { amount: 100 });
  const saved = store.savePersistentData();

  assert.deepEqual(store.getSessionSnapshot(), {
    temporaryInputs: { amount: 100 }
  });
  assert.equal(Object.hasOwn(saved, "sessionState"), false);
  assert.equal(
    storage.getItem(STORAGE_KEYS.PRIMARY).includes("temporaryInputs"),
    false
  );
});

test("保存済み正式データを再読込する", () => {
  const storage = new MemoryStorage();
  const firstStore = createStore(storage);
  firstStore.initialize();
  firstStore.savePersistentData();

  const secondStore = createStore(storage);
  const startup = secondStore.initialize();

  assert.equal(startup.repositoryStatus, "LOADED");
  assert.equal(startup.data.schemaVersion, "1.0");
});

test("候補保存に失敗した場合はStoreの正式snapshotを変更しない", () => {
  const storage = new MemoryStorage();
  const store = createStore(storage);
  store.initialize();
  const before = store.getPersistentSnapshot();
  storage.failOnSet = Object.assign(new Error("quota"), { name: "QuotaExceededError" });
  assert.throws(() => store.commitPersistentData(before), ({ code }) => code === "STORAGE_QUOTA_EXCEEDED");
  assert.deepEqual(store.getPersistentSnapshot(), before);
});
