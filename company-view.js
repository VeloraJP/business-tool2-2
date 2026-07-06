import {
  DATA_ERROR_CODES,
  LEGACY_DATA_STATES,
  STORAGE_KEYS
} from "../config/constants.js";

export class LegacyDataError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "LegacyDataError";
    this.code = code;
  }
}

function hasKey(storage, key) {
  try {
    return storage.getItem(key) !== null;
  } catch (error) {
    throw new LegacyDataError(
      DATA_ERROR_CODES.STORAGE_READ_FAILED,
      "旧データの存在確認に失敗しました。",
      { cause: error }
    );
  }
}

export function detectLegacyData(storage) {
  if (!storage) {
    throw new TypeError("storageは必須です。");
  }

  const hasPrimary = hasKey(storage, STORAGE_KEYS.PRIMARY);
  const hasLegacy = hasKey(storage, STORAGE_KEYS.LEGACY);

  if (hasPrimary && hasLegacy) {
    return LEGACY_DATA_STATES.PRIMARY_WITH_LEGACY;
  }

  if (hasPrimary) {
    return LEGACY_DATA_STATES.PRIMARY_ONLY;
  }

  if (hasLegacy) {
    return LEGACY_DATA_STATES.LEGACY_REQUIRES_CONFIRMATION;
  }

  return LEGACY_DATA_STATES.EMPTY;
}

export function removeLegacyData(storage, { confirmed = false } = {}) {
  if (!confirmed) {
    throw new LegacyDataError(
      DATA_ERROR_CODES.LEGACY_CONFIRMATION_REQUIRED,
      "旧データの削除には利用者の明示承認が必要です。"
    );
  }

  try {
    storage.removeItem(STORAGE_KEYS.LEGACY);
  } catch (error) {
    throw new LegacyDataError(
      DATA_ERROR_CODES.STORAGE_WRITE_FAILED,
      "旧データの削除に失敗しました。",
      { cause: error }
    );
  }
}
