import { calculateBalanceSheetAutoValues } from "../calculators/balance-sheet-auto.js";
import { AMOUNT_INPUT_UNITS, TAX_ACCOUNTING_BASIS, VALUE_MODES } from "../config/constants.js";
import { BS_FIELDS, MANAGEMENT_FIELDS, NEGATIVE_POLICY, PL_FIELDS } from "../data/company-fields.js";
import { createPeriod } from "../data/schema.js";
import { adaptCompanyDataToEngineContext } from "../engines/company-data-adapter.js";
import { runFinancialAnalysisEngine } from "../engines/financial-analysis-engine.js";
import { runProfitEngine } from "../engines/profit-engine.js";
import { convertAmountInputToYen } from "../facades/unit-conversion-facade.js";
import { CompanyInputState } from "../state/company-input-state.js";

const DEFINITIONS = Object.freeze({
  pl: Object.fromEntries(PL_FIELDS.map((field) => [field.id, field])),
  bs: Object.fromEntries(BS_FIELDS.map((field) => [field.id, field])),
  managementInfo: Object.fromEntries(MANAGEMENT_FIELDS.map((field) => [field.id, field]))
});

const PROFIT_RESULT_TO_FIELD = Object.freeze({
  grossProfit: "PL003", laborCostTotal: "PL007", sgAndA: "PL016",
  operatingProfit: "PL017", ordinaryProfit: "PL020", incomeBeforeTax: "PL023",
  netProfit: "PL025"
});

const PROFIT_INPUT_TO_FIELD = Object.freeze({
  salesAmount: "PL001", costOfSales: "PL002", grossProfitAmount: "PL003",
  executiveCompensation: "PL004", salaries: "PL005", statutoryBenefits: "PL006",
  laborCost: "PL007", rent: "PL008", utilities: "PL010", advertising: "PL011",
  fees: "PL012", depreciation: "PL013", otherFixedCosts: "PL014",
  otherVariableCosts: "PL015", sgAndAAmount: "PL016", operatingProfitAmount: "PL017",
  nonOperatingIncome: "PL018", nonOperatingExpenses: "PL019", ordinaryProfitAmount: "PL020",
  extraordinaryIncome: "PL021", extraordinaryLoss: "PL022", incomeBeforeTaxAmount: "PL023",
  corporateTax: "PL024", netProfitAmount: "PL025"
});

function issue(field, code, message) {
  return { field, code, message };
}

function uniqueMessages(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.resultName ?? ""}:${item.field ?? item.path ?? ""}:${item.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeProfitIssues(items) {
  return items.map((item) => {
    const field = PROFIT_INPUT_TO_FIELD[item.field] ?? PROFIT_RESULT_TO_FIELD[item.resultName] ?? item.field;
    return { ...item, field, message: item.code === "REQUIRED" ? `${field}は必須です。` : item.message };
  });
}

function uniqueFields(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.field ?? item.path ?? ""}:${item.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export class CompanyDataController {
  constructor({ store, onChange = () => {} }) {
    this.store = store;
    this.onChange = onChange;
    this.state = new CompanyInputState(store.getPersistentSnapshot());
    if (this.state.draft.companyData.periods.length === 0) {
      this.state.addPeriod(createPeriod({ periodId: "FY1" }));
      this.state.dirty = false;
    }
    this.recalculate();
  }

  refresh() {
    this.onChange(this.viewModel());
  }

  viewModel() {
    return {
      data: this.state.snapshot(),
      period: this.state.currentPeriod() ? structuredClone(this.state.currentPeriod()) : null,
      selectedPeriodId: this.state.selectedPeriodId,
      dirty: this.state.dirty,
      messages: structuredClone(this.state.messages),
      definitions: { pl: PL_FIELDS, bs: BS_FIELDS, managementInfo: MANAGEMENT_FIELDS },
      units: AMOUNT_INPUT_UNITS,
      taxBases: TAX_ACCOUNTING_BASIS
    };
  }

  selectPeriod(periodId) {
    this.state.selectPeriod(periodId);
    this.recalculate();
    this.refresh();
  }

  addPeriod() {
    if (this.state.draft.companyData.periods.length >= 3) {
      this.state.setMessages({ errors: [issue("periods", "MAX_PERIODS", "期データは最大3件です。")] });
      this.refresh();
      return;
    }
    let number = 1;
    const ids = new Set(this.state.draft.companyData.periods.map(({ periodId }) => periodId));
    while (ids.has(`FY${number}`)) number += 1;
    this.state.addPeriod(createPeriod({ periodId: `FY${number}` }));
    this.recalculate();
    this.refresh();
  }

  setCommon(field, value) {
    this.state.updateCommon(field, value);
    this.state.setMessages({});
    this.refresh();
  }

  setPeriodMeta(field, value) {
    const previousPeriodId = this.state.selectedPeriodId;
    this.state.updatePeriod(field, value);
    if (field === "periodId" && previousPeriodId !== value) this.state.selectPeriod(value);
    this.state.setMessages({});
    this.refresh();
  }

  parseValue(definition, rawValue) {
    if (rawValue === "") return { value: null, errors: [] };
    const number = Number(rawValue);
    if (!Number.isFinite(number)) return { value: null, errors: [issue(definition.id, "INVALID_NUMBER", "有限の数値を入力してください。")] };
    if (definition.kind === "integer" && !Number.isInteger(number)) return { value: null, errors: [issue(definition.id, "INTEGER_REQUIRED", "整数で入力してください。")] };
    if (definition.negativePolicy === NEGATIVE_POLICY.DENY && number < 0) return { value: null, errors: [issue(definition.id, "NEGATIVE_NOT_ALLOWED", "マイナス値は入力できません。")] };
    if (definition.kind === "amount") {
      const converted = convertAmountInputToYen(number, this.state.draft.companyData.amountInputUnit);
      return { value: converted.value, errors: converted.errors };
    }
    return { value: number, errors: [] };
  }

  setField(collection, field, rawValue) {
    const staged = this.stageField(collection, field, rawValue);
    this.refresh();
    return staged;
  }

  stageField(collection, field, rawValue) {
    const definition = DEFINITIONS[collection]?.[field];
    if (!definition) return false;
    const parsed = this.parseValue(definition, rawValue);
    if (parsed.errors.length > 0) {
      this.state.setMessages({ errors: parsed.errors });
      return false;
    }
    this.state.updateField(collection, field, parsed.value);
    this.recalculate();
    return true;
  }

  setMode(collection, field, mode) {
    if (!Object.values(VALUE_MODES).includes(mode)) return;
    this.state.updateMode(collection, field, mode);
    this.recalculate();
    this.refresh();
  }

  shouldConfirmRecalculation(collection, changedField) {
    if (collection !== "pl" && collection !== "bs") return false;
    if (DEFINITIONS[collection]?.[changedField]?.auto) return false;
    const values = this.state.currentPeriod()?.[collection] ?? {};
    return Object.values(values).some((entry) => entry?.mode === VALUE_MODES.MANUAL);
  }

  returnManualFieldsToAuto(collection) {
    const values = this.state.currentPeriod()?.[collection] ?? {};
    for (const [field, entry] of Object.entries(values)) {
      if (entry?.mode === VALUE_MODES.MANUAL) this.state.updateMode(collection, field, VALUE_MODES.AUTO);
    }
  }

  setExternalError(error) {
    this.state.setMessages({ errors: [issue("data", error.code ?? "ERROR", error.message ?? "処理に失敗しました。")] });
    this.refresh();
  }

  recalculate() {
    const period = this.state.currentPeriod();
    if (!period) return;
    const errors = [];
    const warnings = [];
    const missingFields = [];

    const context = adaptCompanyDataToEngineContext(this.state.draft.companyData, { periodId: period.periodId });
    errors.push(...context.adapterErrors);
    if (context.adapterErrors.length === 0) {
      const profit = runProfitEngine(context);
      for (const [resultName, field] of Object.entries(PROFIT_RESULT_TO_FIELD)) {
        if (period.pl[field].mode === VALUE_MODES.AUTO) period.pl[field].value = profit.results[resultName] ?? null;
      }
      errors.push(...normalizeProfitIssues(profit.errors));
      warnings.push(...profit.warnings);
      missingFields.push(...normalizeProfitIssues(profit.missingFields));

      const bsAuto = calculateBalanceSheetAutoValues(period.bs);
      for (const field of Object.keys(bsAuto.results)) {
        if (period.bs[field].mode === VALUE_MODES.AUTO) period.bs[field].value = bsAuto.results[field];
      }
      errors.push(...bsAuto.errors);
      missingFields.push(...bsAuto.missingFields);

      const updatedContext = adaptCompanyDataToEngineContext(this.state.draft.companyData, { periodId: period.periodId });
      const financial = runFinancialAnalysisEngine(updatedContext);
      warnings.push(...financial.warnings.filter(({ code }) => code === "BALANCE_SHEET_MISMATCH"));
    }
    this.state.setMessages({
      errors: uniqueMessages(errors),
      warnings: uniqueMessages(warnings),
      missingFields: uniqueFields(missingFields)
    });
  }

  save() {
    if (!Object.values(TAX_ACCOUNTING_BASIS).includes(this.state.draft.companyData.taxAccountingBasis)) {
      this.state.setMessages({ errors: [issue("taxAccountingBasis", "REQUIRED", "税込または税抜を選択してください。")] });
      this.refresh();
      return { ok: false };
    }
    try {
      const saved = this.store.commitPersistentData(this.state.snapshot());
      this.state.markSaved(saved);
      this.recalculate();
      this.state.messages.success = "会社データを保存しました。";
      this.refresh();
      return { ok: true, data: saved };
    } catch (error) {
      const validationErrors = error.validationErrors ?? [];
      this.state.setMessages({ errors: validationErrors.length > 0 ? validationErrors : [issue("save", error.code ?? "SAVE_FAILED", error.message)] });
      this.refresh();
      return { ok: false, error };
    }
  }

  replaceFromImport(data) {
    this.store.replacePersistentData(data);
    this.state.reset(data);
    if (this.state.draft.companyData.periods.length === 0) {
      this.state.addPeriod(createPeriod({ periodId: "FY1" }));
      this.state.dirty = false;
    }
    this.recalculate();
    this.state.messages.success = "JSONデータを読み込みました。";
    this.refresh();
  }
}
