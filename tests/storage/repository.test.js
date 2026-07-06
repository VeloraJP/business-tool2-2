import assert from "node:assert/strict";
import test from "node:test";
import { STORAGE_KEYS } from "../../assets/js/config/constants.js";
import {
  DataRepositoryError,
  LocalStorageRepository
} from "../../assets/js/storage/repository.js";
import { createValidData } from "../fixtures/company-data.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

const SAVE_TIME = "2026-07-01T12:00:00.000Z";

function repository(storage) {
  return new LocalStorageRepository({
    storage,
    now: () => SAVE_TIME
  });
}

test("未保存状態をEMPTYとして返す", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);

  assert.equal(repo.exists(), false);
  assert.deepEqual(repo.load(), { status: "EMPTY", data: null });
});

test("正常データを保存し同じ値を再読込する", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  const data = createValidData();

  const saved = repo.save(data);
  const loaded = repo.load();

  assert.equal(saved.updatedAt, SAVE_TIME);
  assert.equal(loaded.status, "LOADED");
  assert.deepEqual(loaded.data, saved);
  assert.equal(loaded.data.companyData.periods[0].pl.PL001, 0);
  assert.equal(loaded.data.companyData.periods[0].pl.PL003.mode, "MANUAL");
});

test("不正データを保存せず既存値を保持する", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  repo.save(createValidData());
  const before = storage.getItem(STORAGE_KEYS.PRIMARY);

  const invalid = createValidData();
  invalid.companyData.periods.push(structuredClone(invalid.companyData.periods[0]));

  assert.throws(() => repo.save(invalid), (error) => {
    assert.ok(error instanceof DataRepositoryError);
    assert.equal(error.code, "INVALID_DATA");
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), before);
});

test("破損JSONを削除せずエラーにする", () => {
  const storage = new MemoryStorage({
    [STORAGE_KEYS.PRIMARY]: "{broken"
  });
  const repo = repository(storage);

  assert.throws(() => repo.load(), (error) => {
    assert.equal(error.code, "INVALID_JSON");
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), "{broken");
});

test("容量超過時に既存値を保持する", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  repo.save(createValidData());
  const before = storage.getItem(STORAGE_KEYS.PRIMARY);
  const quotaError = new Error("quota");
  quotaError.name = "QuotaExceededError";
  storage.failOnSet = quotaError;

  assert.throws(() => repo.save(createValidData()), (error) => {
    assert.equal(error.code, "STORAGE_QUOTA_EXCEEDED");
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), before);
});

test("読込例外を分類する", () => {
  const storage = new MemoryStorage();
  storage.failOnGet = new Error("read failed");
  const repo = repository(storage);

  assert.throws(() => repo.load(), (error) => {
    assert.equal(error.code, "STORAGE_READ_FAILED");
    return true;
  });
});

test("初期化は表示単位・バージョン・作成日時を保持する", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  const data = createValidData();
  data.settings.amountDisplayUnit = "thousandYen";
  const saved = repo.save(data);

  const reset = repo.clear();

  assert.equal(reset.schemaVersion, "1.0");
  assert.equal(reset.appVersion, "1.0");
  assert.equal(reset.createdAt, saved.createdAt);
  assert.equal(reset.settings.amountDisplayUnit, "thousandYen");
  assert.deepEqual(reset.companyData.periods, []);
  assert.equal(reset.companyData.taxAccountingBasis, null);
});

