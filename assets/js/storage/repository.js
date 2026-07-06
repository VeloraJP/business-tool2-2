import {
  DATA_ERROR_CODES,
  REPOSITORY_STATUS,
  STORAGE_KEYS
} from "../config/constants.js";
import {
  createPersistentData,
  resetPersistentData
} from "../data/schema.js";
import { validatePersistentData } from "./validator.js";

export class DataRepositoryError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "DataRepositoryError";
    this.code = code;
    this.validationErrors = options.validationErrors ?? [];
  }
}

function isQuotaExceededError(error) {
  return (
    error?.name === "QuotaExceededError" ||
    error?.code === 22 ||
    error?.code === 1014
  );
}

export class LocalStorageRepository {
  constructor({
    storage,
    now = () => new Date().toISOString(),
    key = STORAGE_KEYS.PRIMARY
  }) {
    if (!storage) {
      throw new TypeError("storageは必須です。");
    }

    this.storage = storage;
    this.now = now;
    this.key = key;
  }

  exists() {
    try {
      return this.storage.getItem(this.key) !== null;
    } catch (error) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.STORAGE_READ_FAILED,
        "保存データの存在確認に失敗しました。",
        { cause: error }
      );
    }
  }

  load() {
    let raw;

    try {
      raw = this.storage.getItem(this.key);
    } catch (error) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.STORAGE_READ_FAILED,
        "保存データの読込に失敗しました。",
        { cause: error }
      );
    }

    if (raw === null) {
      return { status: REPOSITORY_STATUS.EMPTY, data: null };
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.INVALID_JSON,
        "保存データのJSONが破損しています。",
        { cause: error }
      );
    }

    const validation = validatePersistentData(data);
    if (!validation.valid) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.INVALID_DATA,
        "保存データがVer1.0スキーマに適合しません。",
        { validationErrors: validation.errors }
      );
    }

    return { status: REPOSITORY_STATUS.LOADED, data };
  }

  save(data) {
    const candidate = {
      ...data,
      updatedAt: this.now()
    };
    const validation = validatePersistentData(candidate);

    if (!validation.valid) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.INVALID_DATA,
        "不正なデータは保存できません。",
        { validationErrors: validation.errors }
      );
    }

    let serialized;
    try {
      serialized = JSON.stringify(candidate);
    } catch (error) {
      throw new DataRepositoryError(
        DATA_ERROR_CODES.INVALID_DATA,
        "データをJSONへ変換できません。",
        { cause: error }
      );
    }

    try {
      this.storage.setItem(this.key, serialized);
    } catch (error) {
      const code = isQuotaExceededError(error)
        ? DATA_ERROR_CODES.STORAGE_QUOTA_EXCEEDED
        : DATA_ERROR_CODES.STORAGE_WRITE_FAILED;
      throw new DataRepositoryError(
        code,
        code === DATA_ERROR_CODES.STORAGE_QUOTA_EXCEEDED
          ? "保存容量を超えたため保存できません。"
          : "保存データの書込に失敗しました。",
        { cause: error }
      );
    }

    return candidate;
  }

  clear() {
    const loaded = this.load();
    const current =
      loaded.status === REPOSITORY_STATUS.LOADED
        ? loaded.data
        : createPersistentData({ now: this.now });
    const resetData = resetPersistentData(current, { now: this.now });
    return this.save(resetData);
  }
}

