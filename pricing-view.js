function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class CompanyInputState {
  constructor(persistentData) {
    this.reset(persistentData);
  }

  reset(persistentData) {
    this.draft = clone(persistentData);
    this.dirty = false;
    this.pendingInputs = {};
    this.selectedPeriodId = this.draft.companyData.periods[0]?.periodId ?? null;
    this.messages = { errors: [], warnings: [], missingFields: [], success: "" };
  }

  snapshot() {
    return clone(this.draft);
  }

  currentPeriod() {
    return this.draft.companyData.periods.find(({ periodId }) => periodId === this.selectedPeriodId) ?? null;
  }

  selectPeriod(periodId) {
    this.selectedPeriodId = periodId;
  }

  addPeriod(period) {
    this.draft.companyData.periods.push(clone(period));
    this.selectedPeriodId = period.periodId;
    this.dirty = true;
  }

  updateCommon(field, value) {
    this.draft.companyData[field] = value;
    this.dirty = true;
  }

  updatePeriod(field, value) {
    const period = this.currentPeriod();
    if (!period) return;
    period[field] = value;
    this.dirty = true;
  }

  updateField(collection, field, value) {
    const target = collection === "managementInfo"
      ? this.draft.companyData.managementInfo
      : this.currentPeriod()?.[collection];
    if (!target) return;
    if (target[field] && typeof target[field] === "object" && Object.hasOwn(target[field], "value")) {
      target[field].value = value;
    } else {
      target[field] = value;
    }
    this.dirty = true;
  }

  updateMode(collection, field, mode) {
    const target = this.currentPeriod()?.[collection];
    if (!target?.[field] || typeof target[field] !== "object") return;
    target[field].mode = mode;
    this.dirty = true;
  }

  setMessages(messages = {}) {
    this.messages = {
      errors: messages.errors ?? [],
      warnings: messages.warnings ?? [],
      missingFields: messages.missingFields ?? [],
      success: messages.success ?? ""
    };
  }

  markSaved(persistentData) {
    this.reset(persistentData);
    this.messages.success = "会社データを保存しました。";
  }
}
