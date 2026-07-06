import {
  AMOUNT_DISPLAY_UNITS,
  AMOUNT_INPUT_UNITS,
  APP_VERSION,
  MAX_PERIODS,
  SCHEMA_VERSION,
  TAX_ACCOUNTING_BASIS,
  VALUE_MODES
} from "../config/constants.js";
import {
  BS_FIELDS,
  MANAGEMENT_FIELDS,
  NEGATIVE_POLICY,
  PL_FIELDS
} from "../data/company-fields.js";

const ROOT_KEYS = Object.freeze([
  "schemaVersion",
  "appVersion",
  "createdAt",
  "updatedAt",
  "companyData",
  "settings",
  "metadata"
]);
const COMPANY_KEYS = Object.freeze([
  "taxAccountingBasis",
  "amountInputUnit",
  "periods",
  "managementInfo"
]);
const PERIOD_KEYS = Object.freeze([
  "periodId",
  "startDate",
  "endDate",
  "displayName",
  "pl",
  "bs"
]);
const SETTINGS_KEYS = Object.freeze(["amountDisplayUnit"]);
const AUTO_VALUE_KEYS = Object.freeze(["value", "mode"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function validateExactKeys(value, allowedKeys, path, errors) {
  if (!isPlainObject(value)) {
    addError(errors, path, "TYPE", "オブジェクトである必要があります。");
    return false;
  }

  const actualKeys = Object.keys(value);
  const allowed = new Set(allowedKeys);

  for (const key of allowedKeys) {
    if (!Object.hasOwn(value, key)) {
      addError(errors, `${path}.${key}`, "REQUIRED", "必須項目です。");
    }
  }

  for (const key of actualKeys) {
    if (!allowed.has(key)) {
      addError(errors, `${path}.${key}`, "UNKNOWN_KEY", "Ver1.0対象外の項目です。");
    }
  }

  return true;
}

function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
}

function isIsoDateTime(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = value.match(
    /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/
  );

  return (
    match !== null &&
    isIsoDate(match[1]) &&
    Number.isFinite(Date.parse(value))
  );
}

function validateNullableNumber(value, definition, path, errors) {
  if (value === null) {
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    addError(errors, path, "NUMBER", "有限の数値またはnullである必要があります。");
    return;
  }

  if (definition.kind === "integer" && !Number.isInteger(value)) {
    addError(errors, path, "INTEGER", "整数である必要があります。");
  }

  if (
    definition.negativePolicy === NEGATIVE_POLICY.DENY &&
    value < 0
  ) {
    addError(errors, path, "NEGATIVE_NOT_ALLOWED", "マイナス値は許可されていません。");
  }
}

function validateFieldGroup(value, definitions, path, errors) {
  const expectedIds = definitions.map(({ id }) => id);
  if (!validateExactKeys(value, expectedIds, path, errors)) {
    return;
  }

  for (const definition of definitions) {
    const fieldPath = `${path}.${definition.id}`;
    const fieldValue = value[definition.id];

    if (!definition.auto) {
      validateNullableNumber(fieldValue, definition, fieldPath, errors);
      continue;
    }

    if (!validateExactKeys(fieldValue, AUTO_VALUE_KEYS, fieldPath, errors)) {
      continue;
    }

    validateNullableNumber(
      fieldValue.value,
      definition,
      `${fieldPath}.value`,
      errors
    );

    if (!Object.values(VALUE_MODES).includes(fieldValue.mode)) {
      addError(
        errors,
        `${fieldPath}.mode`,
        "MODE",
        "modeはAUTOまたはMANUALである必要があります。"
      );
    }
  }
}

function validatePeriod(period, index, periodIds, errors) {
  const path = `data.companyData.periods[${index}]`;

  if (!validateExactKeys(period, PERIOD_KEYS, path, errors)) {
    return;
  }

  if (typeof period.periodId !== "string" || period.periodId.trim() === "") {
    addError(errors, `${path}.periodId`, "PERIOD_ID", "空でない文字列が必要です。");
  } else if (periodIds.has(period.periodId)) {
    addError(errors, `${path}.periodId`, "DUPLICATE_PERIOD_ID", "periodIdが重複しています。");
  } else {
    periodIds.add(period.periodId);
  }

  if (!isIsoDate(period.startDate)) {
    addError(errors, `${path}.startDate`, "DATE", "YYYY-MM-DD形式の実在日が必要です。");
  }

  if (!isIsoDate(period.endDate)) {
    addError(errors, `${path}.endDate`, "DATE", "YYYY-MM-DD形式の実在日が必要です。");
  }

  if (
    isIsoDate(period.startDate) &&
    isIsoDate(period.endDate) &&
    period.startDate > period.endDate
  ) {
    addError(errors, path, "DATE_RANGE", "期首日は期末日以前である必要があります。");
  }

  if (typeof period.displayName !== "string") {
    addError(errors, `${path}.displayName`, "TYPE", "文字列である必要があります。");
  }

  validateFieldGroup(period.pl, PL_FIELDS, `${path}.pl`, errors);
  validateFieldGroup(period.bs, BS_FIELDS, `${path}.bs`, errors);
}

export function validatePersistentData(data) {
  const errors = [];

  if (!validateExactKeys(data, ROOT_KEYS, "data", errors)) {
    return { valid: false, errors };
  }

  if (data.schemaVersion !== SCHEMA_VERSION) {
    addError(
      errors,
      "data.schemaVersion",
      "SCHEMA_VERSION",
      `schemaVersionは${SCHEMA_VERSION}である必要があります。`
    );
  }

  if (data.appVersion !== APP_VERSION) {
    addError(
      errors,
      "data.appVersion",
      "APP_VERSION",
      `appVersionは${APP_VERSION}である必要があります。`
    );
  }

  if (!isIsoDateTime(data.createdAt)) {
    addError(errors, "data.createdAt", "DATETIME", "ISO 8601日時が必要です。");
  }

  if (!isIsoDateTime(data.updatedAt)) {
    addError(errors, "data.updatedAt", "DATETIME", "ISO 8601日時が必要です。");
  }

  if (validateExactKeys(data.companyData, COMPANY_KEYS, "data.companyData", errors)) {
    const basis = data.companyData.taxAccountingBasis;
    if (
      basis !== null &&
      !Object.values(TAX_ACCOUNTING_BASIS).includes(basis)
    ) {
      addError(
        errors,
        "data.companyData.taxAccountingBasis",
        "TAX_ACCOUNTING_BASIS",
        "null、TAX_INCLUDED、TAX_EXCLUDEDのいずれかが必要です。"
      );
    }

    if (
      !Object.values(AMOUNT_INPUT_UNITS).includes(
        data.companyData.amountInputUnit
      )
    ) {
      addError(
        errors,
        "data.companyData.amountInputUnit",
        "AMOUNT_INPUT_UNIT",
        "金額入力単位が不正です。"
      );
    }

    if (!Array.isArray(data.companyData.periods)) {
      addError(errors, "data.companyData.periods", "TYPE", "配列である必要があります。");
    } else {
      if (data.companyData.periods.length > MAX_PERIODS) {
        addError(
          errors,
          "data.companyData.periods",
          "MAX_PERIODS",
          `periodsは最大${MAX_PERIODS}件です。`
        );
      }

      const periodIds = new Set();
      data.companyData.periods.forEach((period, index) =>
        validatePeriod(period, index, periodIds, errors)
      );
    }

    validateFieldGroup(
      data.companyData.managementInfo,
      MANAGEMENT_FIELDS,
      "data.companyData.managementInfo",
      errors
    );
  }

  if (validateExactKeys(data.settings, SETTINGS_KEYS, "data.settings", errors)) {
    if (
      !Object.values(AMOUNT_DISPLAY_UNITS).includes(
        data.settings.amountDisplayUnit
      )
    ) {
      addError(
        errors,
        "data.settings.amountDisplayUnit",
        "AMOUNT_DISPLAY_UNIT",
        "金額表示単位が不正です。"
      );
    }
  }

  validateExactKeys(data.metadata, [], "data.metadata", errors);

  return {
    valid: errors.length === 0,
    errors
  };
}
