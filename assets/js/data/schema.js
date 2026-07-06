import {
  AMOUNT_DISPLAY_UNITS,
  AMOUNT_INPUT_UNITS,
  APP_VERSION,
  SCHEMA_VERSION,
  TAX_ACCOUNTING_BASIS,
  VALUE_MODES
} from "../config/constants.js";
import {
  BS_FIELDS,
  MANAGEMENT_FIELDS,
  PL_FIELDS
} from "./company-fields.js";

function createFieldValues(fields) {
  return Object.fromEntries(
    fields.map((definition) => [
      definition.id,
      definition.auto
        ? { value: null, mode: VALUE_MODES.AUTO }
        : null
    ])
  );
}

export function createPeriod({
  periodId = "",
  startDate = "",
  endDate = "",
  displayName = ""
} = {}) {
  return {
    periodId,
    startDate,
    endDate,
    displayName,
    pl: createFieldValues(PL_FIELDS),
    bs: createFieldValues(BS_FIELDS)
  };
}

export function createCompanyData() {
  return {
    taxAccountingBasis: null,
    amountInputUnit: AMOUNT_INPUT_UNITS.YEN,
    periods: [],
    managementInfo: createFieldValues(MANAGEMENT_FIELDS)
  };
}

export function createPersistentData({
  now = () => new Date().toISOString()
} = {}) {
  const timestamp = now();

  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    companyData: createCompanyData(),
    settings: {
      amountDisplayUnit: AMOUNT_DISPLAY_UNITS.YEN
    },
    metadata: {}
  };
}

export function resetPersistentData(
  currentData,
  { now = () => new Date().toISOString() } = {}
) {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    createdAt: currentData?.createdAt ?? now(),
    updatedAt: now(),
    companyData: createCompanyData(),
    settings: {
      amountDisplayUnit:
        currentData?.settings?.amountDisplayUnit ?? AMOUNT_DISPLAY_UNITS.YEN
    },
    metadata: {}
  };
}

export const SUPPORTED_TAX_ACCOUNTING_BASIS = Object.freeze(
  Object.values(TAX_ACCOUNTING_BASIS)
);

