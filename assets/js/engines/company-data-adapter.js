import { VALUE_MODES } from "../config/constants.js";

export const COMPANY_DATA_ADAPTER_CODES = Object.freeze({
  PERIOD_REQUIRED: "PERIOD_REQUIRED",
  PERIOD_NOT_FOUND: "PERIOD_NOT_FOUND",
  PERIOD_NOT_UNIQUE: "PERIOD_NOT_UNIQUE",
  INVALID_MODE: "INVALID_MODE"
});

function adapterError(field, code, message) {
  return { field, code, message };
}

function routeValue(target, field, candidate, source, errors) {
  if (
    candidate &&
    typeof candidate === "object" &&
    !Array.isArray(candidate) &&
    Object.hasOwn(candidate, "value")
  ) {
    if (!Object.values(VALUE_MODES).includes(candidate.mode)) {
      errors.push(adapterError(field, COMPANY_DATA_ADAPTER_CODES.INVALID_MODE, `${field}のmodeが不正です。`));
      return;
    }
    const collection = candidate.mode === VALUE_MODES.MANUAL
      ? target.savedManual
      : target.savedAuto;
    collection[field] = {
      value: candidate.value,
      mode: candidate.mode,
      source
    };
    return;
  }
  target.derived[field] = candidate;
}

function routeCollection(target, collection, source, errors) {
  for (const [field, candidate] of Object.entries(collection ?? {})) {
    routeValue(target, field, candidate, { ...source, field }, errors);
  }
}

export function adaptCompanyDataToEngineContext(
  companyData,
  { periodId, screenManual = {} } = {}
) {
  const result = {
    screenManual: { ...screenManual },
    savedManual: {},
    savedAuto: {},
    derived: {},
    adapterErrors: []
  };

  if (periodId === null || periodId === undefined || periodId === "") {
    result.adapterErrors.push(adapterError("periodId", COMPANY_DATA_ADAPTER_CODES.PERIOD_REQUIRED, "periodIdは必須です。"));
    return result;
  }

  const matchingPeriods = (companyData?.periods ?? []).filter((period) => period?.periodId === periodId);
  if (matchingPeriods.length === 0) {
    result.adapterErrors.push(adapterError("periodId", COMPANY_DATA_ADAPTER_CODES.PERIOD_NOT_FOUND, "対象期が見つかりません。"));
    return result;
  }
  if (matchingPeriods.length > 1) {
    result.adapterErrors.push(adapterError("periodId", COMPANY_DATA_ADAPTER_CODES.PERIOD_NOT_UNIQUE, "対象期を一意に特定できません。"));
    return result;
  }

  const period = matchingPeriods[0];
  routeCollection(result, period.pl, { collection: "pl", periodId }, result.adapterErrors);
  routeCollection(result, period.bs, { collection: "bs", periodId }, result.adapterErrors);
  routeCollection(result, companyData?.managementInfo, { collection: "managementInfo" }, result.adapterErrors);

  result.derived.taxAccountingBasis = companyData?.taxAccountingBasis ?? null;
  result.derived.amountInputUnit = companyData?.amountInputUnit ?? null;
  result.derived.CM001 = result.derived.taxAccountingBasis;
  result.derived.CM002 = result.derived.amountInputUnit;
  result.derived.periodId = period.periodId;
  result.derived.periodStartDate = period.startDate;
  result.derived.periodEndDate = period.endDate;

  return result;
}
