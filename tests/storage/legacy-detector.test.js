import assert from "node:assert/strict";
import test from "node:test";
import {
  detectLegacyData,
  removeLegacyData
} from "../../assets/js/storage/legacy-detector.js";
import { STORAGE_KEYS } from "../../assets/js/config/constants.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

test("正式・旧版キーの存在組合せを分類する", () => {
  assert.equal(detectLegacyData(new MemoryStorage()), "EMPTY");
  assert.equal(
    detectLegacyData(new MemoryStorage({ [STORAGE_KEYS.PRIMARY]: "{}" })),
    "PRIMARY_ONLY"
  );
  assert.equal(
    detectLegacyData(new MemoryStorage({ [STORAGE_KEYS.LEGACY]: "legacy" })),
    "LEGACY_REQUIRES_CONFIRMATION"
  );
  assert.equal(
    detectLegacyData(new MemoryStorage({
      [STORAGE_KEYS.PRIMARY]: "{}",
      [STORAGE_KEYS.LEGACY]: "legacy"
    })),
    "PRIMARY_WITH_LEGACY"
  );
});

test("明示承認なしにfaProを削除しない", () => {
  const storage = new MemoryStorage({ [STORAGE_KEYS.LEGACY]: "legacy" });

  assert.throws(() => removeLegacyData(storage), (error) => {
    assert.equal(error.code, "LEGACY_CONFIRMATION_REQUIRED");
    return true;
  });
  assert.equal(storage.getItem(STORAGE_KEYS.LEGACY), "legacy");
});

test("明示承認時だけfaProを削除し正式データを作らない", () => {
  const storage = new MemoryStorage({ [STORAGE_KEYS.LEGACY]: "legacy" });

  removeLegacyData(storage, { confirmed: true });

  assert.equal(storage.getItem(STORAGE_KEYS.LEGACY), null);
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), null);
});

test("旧データ読込・削除のStorage例外を分類する", () => {
  const readFailure = new MemoryStorage();
  readFailure.failOnGet = new Error("read");
  assert.throws(() => detectLegacyData(readFailure), (error) => {
    assert.equal(error.code, "STORAGE_READ_FAILED");
    return true;
  });

  const writeFailure = new MemoryStorage({
    [STORAGE_KEYS.LEGACY]: "legacy"
  });
  writeFailure.failOnRemove = new Error("write");
  assert.throws(
    () => removeLegacyData(writeFailure, { confirmed: true }),
    (error) => {
      assert.equal(error.code, "STORAGE_WRITE_FAILED");
      return true;
    }
  );
});
