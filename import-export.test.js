import { createPeriod, createPersistentData } from "../../assets/js/data/schema.js";

export const FIXED_NOW = "2026-07-01T00:00:00.000Z";

export function createValidData() {
  const data = createPersistentData({ now: () => FIXED_NOW });
  const period = createPeriod({
    periodId: "FY2025",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    displayName: "2026年3月期"
  });

  period.pl.PL001 = 0;
  period.pl.PL003 = { value: -10, mode: "MANUAL" };
  period.bs.BS026 = { value: -50, mode: "MANUAL" };
  data.companyData.periods.push(period);
  data.companyData.managementInfo.MG001 = 0;

  return data;
}

