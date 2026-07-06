import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_IMPORT_BYTES,
  STORAGE_KEYS
} from "../../assets/js/config/constants.js";
import {
  exportPersistentData,
  getUtf8ByteLength,
  importPersistentData,
  parseImportedData
} from "../../assets/js/storage/import-export.js";
import { LocalStorageRepository } from "../../assets/js/storage/repository.js";
import { createValidData } from "../fixtures/company-data.js";
import { MemoryStorage } from "../helpers/memory-storage.js";

function repository(storage) {
  return new LocalStorageRepository({
    storage,
    now: () => "2026-07-01T12:00:00.000Z"
  });
}

test("正常データをJSONへ出力し再解析できる", () => {
  const data = createValidData();
  const text = exportPersistentData(data);
  const parsed = parseImportedData(text);

  assert.deepEqual(parsed, data);
});

test("UTF-8バイト数を使用する", () => {
  assert.equal(getUtf8ByteLength("abc"), 3);
  assert.equal(getUtf8ByteLength("あ"), 3);
});

test("5MBちょうどを許可し、1バイト超過を拒否する", () => {
  const text = exportPersistentData(createValidData());

  assert.doesNotThrow(() =>
    parseImportedData(text, { byteLength: MAX_IMPORT_BYTES })
  );
  assert.throws(
    () => parseImportedData(text, { byteLength: MAX_IMPORT_BYTES + 1 }),
    (error) => {
      assert.equal(error.code, "FILE_TOO_LARGE");
      return true;
    }
  );
});

test("指定サイズが実データより小さくても実バイト数を優先する", () => {
  const oversizedText = " ".repeat(MAX_IMPORT_BYTES + 1);

  assert.throws(
    () => parseImportedData(oversizedText, { byteLength: 1 }),
    (error) => {
      assert.equal(error.code, "FILE_TOO_LARGE");
      return true;
    }
  );
});

test("文字列以外をJSONとして受理しない", () => {
  assert.throws(() => parseImportedData(null), (error) => {
    assert.equal(error.code, "INVALID_JSON");
    return true;
  });
});

test("不正JSONと非対応schemaVersionを拒否する", () => {
  assert.throws(() => parseImportedData("{"), (error) => {
    assert.equal(error.code, "INVALID_JSON");
    return true;
  });

  const data = createValidData();
  data.schemaVersion = "2.0";
  assert.throws(() => parseImportedData(JSON.stringify(data)), (error) => {
    assert.equal(error.code, "UNSUPPORTED_SCHEMA_VERSION");
    return true;
  });
});

test("不正インポートで既存データを変更しない", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  repo.save(createValidData());
  const before = storage.getItem(STORAGE_KEYS.PRIMARY);
  const invalid = createValidData();
  invalid.companyData.periods = Array(4).fill(invalid.companyData.periods[0]);

  assert.throws(() =>
    importPersistentData({
      text: JSON.stringify(invalid),
      repository: repo
    })
  );
  assert.equal(storage.getItem(STORAGE_KEYS.PRIMARY), before);
});

test("検証済みデータだけをRepositoryへ一括反映する", () => {
  const storage = new MemoryStorage();
  const repo = repository(storage);
  const data = createValidData();

  const saved = importPersistentData({
    text: exportPersistentData(data),
    repository: repo
  });

  assert.equal(saved.updatedAt, "2026-07-01T12:00:00.000Z");
  assert.equal(repo.load().status, "LOADED");
});
