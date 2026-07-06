import { createValidData } from "./company-data.js";

export function createDataWithFourPeriods() {
  const data = createValidData();
  const template = data.companyData.periods[0];

  data.companyData.periods = Array.from({ length: 4 }, (_, index) => ({
    ...structuredClone(template),
    periodId: `FY${index + 1}`
  }));

  return data;
}

export function createDataWithInvalidMode() {
  const data = createValidData();
  data.companyData.periods[0].pl.PL003.mode = "UNKNOWN";
  return data;
}

