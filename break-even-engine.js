import { CATEGORY_BY_ID, CATEGORY_IDS } from "../config/categories.js";
import { AMOUNT_INPUT_UNITS, COST_CLASSIFICATIONS, STANDARD_EFFECTIVE_TAX_RATE, STANDARD_SOCIAL_INSURANCE_RATE } from "../config/constants.js";
import { STANDARD_COST_CLASSIFICATIONS } from "../data/fixed-variable-costs.js";
import { adaptCompanyDataToEngineContext } from "../engines/company-data-adapter.js";
import { ENGINE_IDS, runEngine } from "../engines/engine-runner.js";
import { convertAmountInputToYen } from "../facades/unit-conversion-facade.js";
import { percentInputToRate, rateToPercentInput } from "../facades/rate-conversion-facade.js";
import { CategoryState } from "../state/category-state.js";
import { SIMULATION_BY_ID, SIMULATIONS_BY_CATEGORY } from "../config/simulation-results.js";

const METRICS = Object.freeze({
  salesAmount: ["pl", "PL001"],
  operatingProfit: ["pl", "PL017"],
  ordinaryProfit: ["pl", "PL020"],
  netProfit: ["pl", "PL025"],
  totalAssets: ["bs", "BS012"],
  netAssets: ["bs", "BS026"]
});

function issue(field, code, message) {
  return { field, code, message };
}

function valueOf(entry) {
  return entry && typeof entry === "object" && Object.hasOwn(entry, "value") ? entry.value : entry;
}

function metricValue(period, metric) {
  const [collection, field] = METRICS[metric] ?? [];
  return collection ? valueOf(period?.[collection]?.[field]) : null;
}

function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.field ?? item.path ?? item.resultName ?? ""}:${item.code ?? ""}:${item.message ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contextWith(base, screenManual = {}, derived = {}) {
  return {
    ...base,
    screenManual: { ...(base.screenManual ?? {}), ...screenManual },
    derived: { ...(base.derived ?? {}), ...derived },
    taxBases: [base.derived?.taxAccountingBasis],
    units: [base.derived?.amountInputUnit]
  };
}

export class CategoryAnalysisController {
  constructor({ store, onChange = () => {} }) {
    this.store = store;
    this.onChange = onChange;
    this.state = new CategoryState();
  }

  companyData() {
    return this.store.getPersistentSnapshot()?.companyData ?? { periods: [], managementInfo: {} };
  }

  defaults(categoryId) {
    const periods = this.companyData().periods ?? [];
    const defaults = {};
    defaults.simulationId = SIMULATIONS_BY_CATEGORY[categoryId]?.[0]?.id ?? null;
    if (categoryId === CATEGORY_IDS.HIRING || categoryId === CATEGORY_IDS.OPERATING_PROFIT) defaults.socialInsuranceRatePercent = rateToPercentInput(STANDARD_SOCIAL_INSURANCE_RATE).value;
    if (categoryId === CATEGORY_IDS.STATUS) defaults.effectiveTaxRatePercent = rateToPercentInput(STANDARD_EFFECTIVE_TAX_RATE).value;
    if (categoryId === CATEGORY_IDS.FINANCING) defaults.repaymentMethod = "EQUAL_PAYMENT";
    if (categoryId === CATEGORY_IDS.COMPARISON) {
      defaults.metric = "salesAmount";
      defaults.sourcePeriodId = periods.at(-2)?.periodId ?? periods[0]?.periodId ?? "";
      defaults.targetPeriodId = periods.at(-1)?.periodId ?? periods[0]?.periodId ?? "";
    }
    return defaults;
  }

  ensureDefaults(categoryId) {
    const state = this.state.ensure(categoryId);
    for (const [field, value] of Object.entries(this.defaults(categoryId))) {
      if (!Object.hasOwn(state.inputs, field)) state.inputs[field] = value;
    }
  }

  parseInputs(categoryId) {
    this.ensureDefaults(categoryId);
    const definition = CATEGORY_BY_ID[categoryId];
    const state = this.state.ensure(categoryId);
    const companyData = this.companyData();
    const unit = companyData.amountInputUnit ?? AMOUNT_INPUT_UNITS.YEN;
    const values = {};
    const errors = [];
    for (const field of definition.inputs) {
      const raw = state.inputs[field.id];
      if (raw === "" || raw === null || raw === undefined) continue;
      if (field.kind === "select" || field.kind === "period") {
        values[field.id] = raw;
        continue;
      }
      const number = Number(raw);
      if (!Number.isFinite(number)) {
        errors.push(issue(field.id, "INVALID_NUMBER", `${field.label}は有限の数値で入力してください。`));
        continue;
      }
      if (field.kind === "integer" && !Number.isInteger(number)) {
        errors.push(issue(field.id, "INTEGER_REQUIRED", `${field.label}は整数で入力してください。`));
        continue;
      }
      if (field.kind === "amount") {
        const converted = convertAmountInputToYen(number, unit);
        if (converted.errors.length) errors.push(...converted.errors.map((item) => ({ ...item, field: field.id })));
        else values[field.id] = converted.value;
      } else if (field.kind === "percent") {
        const converted = percentInputToRate(number);
        if (converted.errors.length) errors.push(...converted.errors.map((item) => ({ ...item, field: field.id })));
        else values[field.id.replace(/Percent$/, "")] = converted.value;
      } else {
        values[field.id] = number;
      }
    }
    return { values, errors };
  }

  selectedPeriod(categoryId, inputs) {
    const periods = this.companyData().periods ?? [];
    const periodId = categoryId === CATEGORY_IDS.COMPARISON ? inputs.targetPeriodId : periods.at(-1)?.periodId;
    return periods.find((period) => period.periodId === periodId) ?? periods.at(-1) ?? null;
  }

  baseContext(periodId, screenManual = {}) {
    const companyData = this.companyData();
    return adaptCompanyDataToEngineContext(companyData, { periodId, screenManual });
  }

  run(engineResults, engineId, context) {
    engineResults[engineId] = runEngine(engineId, context);
    return engineResults[engineId];
  }

  runComparison(categoryId, inputs, engineResults) {
    const periods = this.companyData().periods ?? [];
    const source = periods.find(({ periodId }) => periodId === inputs.sourcePeriodId);
    const target = periods.find(({ periodId }) => periodId === inputs.targetPeriodId);
    const metric = inputs.metric ?? "salesAmount";
    const sourceValue = metricValue(source, metric);
    const targetValue = metricValue(target, metric);
    const periodIds = [source?.periodId, target?.periodId].filter(Boolean);
    const companyData = this.companyData();
    const context = {
      screenManual: { sourceValue, targetValue, periods: periodIds, metric, previousValue: sourceValue, currentValue: targetValue, initialValue: sourceValue, finalValue: targetValue, sourcePeriodEnd: source?.endDate, targetPeriodEnd: target?.endDate },
      taxBases: [companyData.taxAccountingBasis, companyData.taxAccountingBasis],
      units: [companyData.amountInputUnit, companyData.amountInputUnit]
    };
    this.run(engineResults, ENGINE_IDS.COMPARISON, context);
    this.run(engineResults, ENGINE_IDS.GROWTH, context);
    if (target) {
      const base = this.baseContext(target.periodId);
      this.run(engineResults, ENGINE_IDS.PROFIT, base);
      this.run(engineResults, ENGINE_IDS.FINANCIAL_ANALYSIS, base);
    }
  }

  analyze(categoryId) {
    const definition = CATEGORY_BY_ID[categoryId];
    if (!definition) return null;
    const parsed = this.parseInputs(categoryId);
    const engineResults = {};
    const period = this.selectedPeriod(categoryId, parsed.values);
    const base = period ? this.baseContext(period.periodId, parsed.values) : {
      screenManual: parsed.values,
      savedManual: {},
      savedAuto: {},
      derived: {},
      adapterErrors: categoryId === CATEGORY_IDS.COMPARISON
        ? [issue("periodId", "PERIOD_REQUIRED", "比較には会社データの対象期が必要です。")]
        : []
    };
    const context = contextWith(base, parsed.values);

    if (categoryId === CATEGORY_IDS.STATUS) {
      this.run(engineResults, ENGINE_IDS.PROFIT, context);
      this.run(engineResults, ENGINE_IDS.FINANCIAL_ANALYSIS, context);
      this.run(engineResults, ENGINE_IDS.TAX, context);
      this.run(engineResults, ENGINE_IDS.CASH_FLOW, context);
      const periods = this.companyData().periods ?? [];
      if (periods.length >= 2) {
        const previous = periods.at(-2);
        const current = periods.at(-1);
        this.run(engineResults, ENGINE_IDS.GROWTH, { screenManual: { metric: "salesAmount", previousValue: metricValue(previous, "salesAmount"), currentValue: metricValue(current, "salesAmount"), initialValue: metricValue(previous, "salesAmount"), finalValue: metricValue(current, "salesAmount"), sourcePeriodEnd: previous.endDate, targetPeriodEnd: current.endDate, periods: [previous.periodId, current.periodId] } });
      }
    } else if (categoryId === CATEGORY_IDS.OPERATING_PROFIT || categoryId === CATEGORY_IDS.TARGET) {
      const classifications = { ...STANDARD_COST_CLASSIFICATIONS, ...this.state.ensure(categoryId).costClassifications };
      const breakEven = this.run(engineResults, ENGINE_IDS.BREAK_EVEN, { ...context, costClassifications: classifications });
      const requiredSales = parsed.values.requiredSalesAmount ?? breakEven.results.requiredSalesForTargetOperatingProfit;
      this.run(engineResults, ENGINE_IDS.SALES, contextWith(context, parsed.values, { requiredSalesAmount: { value: requiredSales, source: { engineId: ENGINE_IDS.BREAK_EVEN, resultName: "requiredSalesForTargetOperatingProfit" } } }));
      this.run(engineResults, ENGINE_IDS.PROFIT, context);
      this.run(engineResults, ENGINE_IDS.PRICING, context);
      if (categoryId === CATEGORY_IDS.OPERATING_PROFIT) {
        const marginalProfitRate = breakEven.results.marginalProfitRate;
        this.run(engineResults, ENGINE_IDS.LABOR_COST, contextWith(context, parsed.values, { marginalProfitRate: { value: marginalProfitRate, source: { engineId: ENGINE_IDS.BREAK_EVEN, resultName: "marginalProfitRate" } } }));
      }
    } else if (categoryId === CATEGORY_IDS.PRICING) {
      const breakEven = this.run(engineResults, ENGINE_IDS.BREAK_EVEN, context);
      this.run(engineResults, ENGINE_IDS.PRICING, context);
      this.run(engineResults, ENGINE_IDS.SALES, contextWith(context, parsed.values, { requiredSalesAmount: breakEven.results.requiredSalesForTargetOperatingProfit }));
    } else if (categoryId === CATEGORY_IDS.HIRING) {
      const breakEven = this.run(engineResults, ENGINE_IDS.BREAK_EVEN, context);
      this.run(engineResults, ENGINE_IDS.LABOR_COST, contextWith(context, parsed.values, { marginalProfitRate: { value: breakEven.results.marginalProfitRate, source: { engineId: ENGINE_IDS.BREAK_EVEN, resultName: "marginalProfitRate" } } }));
      this.run(engineResults, ENGINE_IDS.PROFIT, context);
      this.run(engineResults, ENGINE_IDS.SALES, context);
    } else if (categoryId === CATEGORY_IDS.FINANCING) {
      const loan = this.run(engineResults, ENGINE_IDS.LOAN_REPAYMENT, context);
      this.run(engineResults, ENGINE_IDS.CASH_FLOW, contextWith(context, parsed.values, { monthlyLoanPayment: { value: loan.results.monthlyPayment, source: { engineId: ENGINE_IDS.LOAN_REPAYMENT, resultName: "monthlyPayment" } } }));
    } else if (categoryId === CATEGORY_IDS.INVESTMENT) {
      this.run(engineResults, ENGINE_IDS.INVESTMENT_RETURN, context);
    } else if (categoryId === CATEGORY_IDS.COMPARISON) {
      this.runComparison(categoryId, parsed.values, engineResults);
    }

    const attachEngine = (kind) => Object.entries(engineResults).flatMap(([engineId, result]) => result[kind].map((item) => ({ ...item, engineId })));
    const messages = {
      errors: unique([...parsed.errors, ...(base.adapterErrors ?? []), ...attachEngine("errors")]),
      warnings: unique(attachEngine("warnings")),
      missingFields: unique(attachEngine("missingFields"))
    };
    this.state.setResults(categoryId, engineResults, messages);
    return this.viewModel(categoryId);
  }

  viewModel(categoryId) {
    this.ensureDefaults(categoryId);
    const definition = CATEGORY_BY_ID[categoryId];
    const categoryState = this.state.snapshot(categoryId);
    const companyData = this.companyData();
    return {
      definition,
      ...categoryState,
      periods: companyData.periods ?? [],
      amountInputUnit: companyData.amountInputUnit ?? AMOUNT_INPUT_UNITS.YEN,
      taxAccountingBasis: companyData.taxAccountingBasis,
      standardCostClassifications: STANDARD_COST_CLASSIFICATIONS,
      costClassificationOptions: COST_CLASSIFICATIONS,
      simulations: SIMULATIONS_BY_CATEGORY[categoryId] ?? [],
      simulation: SIMULATION_BY_ID[categoryState.inputs.simulationId] ?? SIMULATIONS_BY_CATEGORY[categoryId]?.[0] ?? null
    };
  }

  setInput(categoryId, field, value) {
    this.state.setInput(categoryId, field, value);
    this.analyze(categoryId);
    this.onChange(this.viewModel(categoryId));
  }

  stageInput(categoryId, field, value) {
    this.state.setInput(categoryId, field, value);
  }

  setScroll(categoryId, scrollY) {
    this.state.ensure(categoryId).scrollY = Math.max(0, Number(scrollY) || 0);
  }

  selectSection(categoryId, sectionId) {
    if (!["choose", "simple", "detail"].includes(sectionId)) return;
    this.state.setSection(categoryId, sectionId);
    this.onChange(this.viewModel(categoryId));
  }

  calculate(categoryId) {
    this.analyze(categoryId);
    this.state.markCalculated(categoryId);
    this.onChange(this.viewModel(categoryId));
  }

  setCostClassification(categoryId, field, value) {
    if (!Object.values(COST_CLASSIFICATIONS).includes(value)) return;
    this.state.setCostClassification(categoryId, field, value);
    this.analyze(categoryId);
    this.onChange(this.viewModel(categoryId));
  }
}
