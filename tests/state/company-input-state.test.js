import test from "node:test";
import assert from "node:assert/strict";
import { createPeriod, createPersistentData } from "../../assets/js/data/schema.js";
import { CompanyInputState } from "../../assets/js/state/company-input-state.js";

test("会社入力stateは正式snapshotとdraftを分離し0とmodeを保持する", () => {
  const data = createPersistentData({ now: () => "2026-07-02T00:00:00.000Z" });
  const period = createPeriod({ periodId: "FY1" });
  data.companyData.periods.push(period);
  const state = new CompanyInputState(data);
  state.updateField("pl", "PL001", 0);
  state.updateMode("pl", "PL003", "MANUAL");
  state.updateField("pl", "PL003", -10);
  assert.equal(state.currentPeriod().pl.PL001, 0);
  assert.deepEqual(state.currentPeriod().pl.PL003, { value: -10, mode: "MANUAL" });
  assert.equal(data.companyData.periods[0].pl.PL001, null);
  assert.equal(state.dirty, true);
});
