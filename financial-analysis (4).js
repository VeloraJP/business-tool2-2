import * as calculator from "../calculators/profit.js";
import { addEngineWarning, createEngineResult, derivedInput, recordCalculation, recordResolvedValue } from "./contract.js";
import { INPUT_SOURCE_TYPES, resolveInputs } from "./input-resolver.js";

const ADOPTED_VALIDATION = Object.freeze({
  grossProfit: {}, laborCostTotal: { nonNegative: true }, sgAndA: { nonNegative: true },
  operatingProfit: {}, ordinaryProfit: {}, incomeBeforeTax: {},
  corporateTax: { nonNegative: true }, netProfit: {}
});

function normalizedInput(result, resultName, original) {
  if (original.missing) return derivedInput(result.results[resultName], resultName);
  return {
    ...original,
    field: resultName,
    value: result.results[resultName],
    missing: result.results[resultName] === null || result.results[resultName] === undefined
  };
}

function adoptedOrCalculated(result, resultName, adopted, calculationResult, basis) {
  return adopted.missing
    ? recordCalculation(result, resultName, calculationResult, basis)
    : recordResolvedValue(result, resultName, adopted, {
      rounding: basis.rounding,
      validation: ADOPTED_VALIDATION[resultName] ?? {}
    });
}

function warnIfMismatch(result, resultName, adopted, expected) {
  if (
    !adopted.missing &&
    adopted.source?.type === INPUT_SOURCE_TYPES.SAVED_AUTO &&
    expected.value !== null &&
    result.results[resultName] !== null &&
    result.results[resultName] !== expected.value
  ) {
    addEngineWarning(result, resultName, adopted.field, "AUTO_DETAIL_MISMATCH", `${resultName}と計算可能な内訳が一致しません。`);
  }
}

export function runProfitEngine(context = {}) {
  const result = createEngineResult();
  const input = resolveInputs(context, {
    salesAmount: ["salesAmount", "PL001"], costOfSales: ["costOfSales", "PL002"],
    grossProfit: ["grossProfit", "PL003"], executiveCompensation: ["executiveCompensation", "PL004"],
    salaries: ["salaries", "PL005"], statutoryBenefits: ["statutoryBenefits", "PL006"],
    laborCostTotal: ["laborCostTotal", "PL007"], rent: ["rent", "PL008"], utilities: ["utilities", "PL010"],
    advertising: ["advertising", "PL011"], fees: ["fees", "PL012"], depreciation: ["depreciation", "PL013"],
    otherFixedCosts: ["otherFixedCosts", "PL014"], otherVariableCosts: ["otherVariableCosts", "PL015"],
    sgAndA: ["sgAndA", "PL016"], operatingProfit: ["operatingProfit", "PL017"],
    nonOperatingIncome: ["nonOperatingIncome", "PL018"], nonOperatingExpenses: ["nonOperatingExpenses", "PL019"],
    ordinaryProfit: ["ordinaryProfit", "PL020"], extraordinaryIncome: ["extraordinaryIncome", "PL021"],
    extraordinaryLoss: ["extraordinaryLoss", "PL022"], incomeBeforeTax: ["incomeBeforeTax", "PL023"],
    corporateTax: ["corporateTax", "corporateTaxEstimate", "PL024"], netProfit: ["netProfit", "PL025"]
  });

  adoptedOrCalculated(result, "grossProfit", input.grossProfit, calculator.calculateGrossProfit(input.salesAmount.value, input.costOfSales.value), {
    formula: "salesAmount - costOfSales", rounding: "ROUND_YEN", inputs: { salesAmount: input.salesAmount, costOfSales: input.costOfSales }
  });
  adoptedOrCalculated(result, "laborCostTotal", input.laborCostTotal, calculator.calculateLaborCostTotal(input.executiveCompensation.value, input.salaries.value, input.statutoryBenefits.value), {
    formula: "executiveCompensation + salaries + statutoryBenefits", rounding: "ROUND_YEN", inputs: { executiveCompensation: input.executiveCompensation, salaries: input.salaries, statutoryBenefits: input.statutoryBenefits }
  });

  const labor = normalizedInput(result, "laborCostTotal", input.laborCostTotal);
  const sgInputs = { laborCost: labor, rent: input.rent, utilities: input.utilities, advertising: input.advertising, fees: input.fees, depreciation: input.depreciation, otherFixedCosts: input.otherFixedCosts, otherVariableCosts: input.otherVariableCosts };
  const sgValues = Object.fromEntries(Object.entries(sgInputs).map(([key, value]) => [key, value.value]));
  adoptedOrCalculated(result, "sgAndA", input.sgAndA, calculator.calculateSellingGeneralAndAdministrativeExpenses(sgValues), {
    formula: "laborCost + PL008 + PL010 + PL011 + PL012 + PL013 + PL014 + PL015", rounding: "ROUND_YEN", inputs: sgInputs
  });

  const gross = normalizedInput(result, "grossProfit", input.grossProfit);
  const sg = normalizedInput(result, "sgAndA", input.sgAndA);
  adoptedOrCalculated(result, "operatingProfit", input.operatingProfit, calculator.calculateOperatingProfit(gross.value, sg.value), {
    formula: "grossProfit - sgAndA", rounding: "ROUND_YEN", inputs: { grossProfit: gross, sgAndA: sg }
  });
  const operating = normalizedInput(result, "operatingProfit", input.operatingProfit);
  adoptedOrCalculated(result, "ordinaryProfit", input.ordinaryProfit, calculator.calculateOrdinaryProfit(operating.value, input.nonOperatingIncome.value, input.nonOperatingExpenses.value), {
    formula: "operatingProfit + nonOperatingIncome - nonOperatingExpenses", rounding: "ROUND_YEN", inputs: { operatingProfit: operating, nonOperatingIncome: input.nonOperatingIncome, nonOperatingExpenses: input.nonOperatingExpenses }
  });
  const ordinary = normalizedInput(result, "ordinaryProfit", input.ordinaryProfit);
  adoptedOrCalculated(result, "incomeBeforeTax", input.incomeBeforeTax, calculator.calculateIncomeBeforeTax(ordinary.value, input.extraordinaryIncome.value, input.extraordinaryLoss.value), {
    formula: "ordinaryProfit + extraordinaryIncome - extraordinaryLoss", rounding: "ROUND_YEN", inputs: { ordinaryProfit: ordinary, extraordinaryIncome: input.extraordinaryIncome, extraordinaryLoss: input.extraordinaryLoss }
  });
  recordResolvedValue(result, "corporateTax", input.corporateTax, { rounding: "ROUND_YEN", validation: ADOPTED_VALIDATION.corporateTax });
  const beforeTax = normalizedInput(result, "incomeBeforeTax", input.incomeBeforeTax);
  const corporateTax = normalizedInput(result, "corporateTax", input.corporateTax);
  adoptedOrCalculated(result, "netProfit", input.netProfit, calculator.calculateNetProfit(beforeTax.value, corporateTax.value), {
    formula: "incomeBeforeTax - corporateTax", rounding: "ROUND_YEN", inputs: { incomeBeforeTax: beforeTax, corporateTax }
  });

  const sales = input.salesAmount;
  for (const [name, rateCalculator] of [["grossProfit", calculator.calculateGrossProfitRate], ["operatingProfit", calculator.calculateOperatingProfitRate], ["ordinaryProfit", calculator.calculateOrdinaryProfitRate], ["netProfit", calculator.calculateNetProfitRate]]) {
    const source = derivedInput(result.results[name], name);
    recordCalculation(result, `${name}Rate`, rateCalculator(source.value, sales.value), { formula: `${name} ÷ salesAmount`, inputs: { [name]: source, salesAmount: sales } });
  }
  if (input.sgAndA.source?.type === INPUT_SOURCE_TYPES.SAVED_AUTO && result.results.sgAndA !== null && sgValues && Object.values(sgValues).every((value) => typeof value === "number")) {
    const expected = calculator.calculateSellingGeneralAndAdministrativeExpenses(sgValues).value;
    if (expected !== null && expected !== result.results.sgAndA) addEngineWarning(result, "sgAndA", "PL016", "SGA_DETAIL_MISMATCH", "販管費合計と内訳合計が一致しません。");
  }
  warnIfMismatch(result, "grossProfit", input.grossProfit, calculator.calculateGrossProfit(input.salesAmount.value, input.costOfSales.value));
  warnIfMismatch(result, "laborCostTotal", input.laborCostTotal, calculator.calculateLaborCostTotal(input.executiveCompensation.value, input.salaries.value, input.statutoryBenefits.value));
  warnIfMismatch(result, "operatingProfit", input.operatingProfit, calculator.calculateOperatingProfit(result.results.grossProfit, result.results.sgAndA));
  warnIfMismatch(result, "ordinaryProfit", input.ordinaryProfit, calculator.calculateOrdinaryProfit(result.results.operatingProfit, input.nonOperatingIncome.value, input.nonOperatingExpenses.value));
  warnIfMismatch(result, "incomeBeforeTax", input.incomeBeforeTax, calculator.calculateIncomeBeforeTax(result.results.ordinaryProfit, input.extraordinaryIncome.value, input.extraordinaryLoss.value));
  warnIfMismatch(result, "netProfit", input.netProfit, calculator.calculateNetProfit(result.results.incomeBeforeTax, input.corporateTax.value));
  return result;
}
