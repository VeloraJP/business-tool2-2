import { calculateAdoptedValue } from "../calculators/validation.js";

export const ENGINE_RESULT_KEYS = Object.freeze([
  "results",
  "errors",
  "warnings",
  "missingFields",
  "calculationBasis",
  "usedInputs",
  "inputSources"
]);

export function createEngineResult() {
  return {
    results: {},
    errors: [],
    warnings: [],
    missingFields: [],
    calculationBasis: {},
    usedInputs: {},
    inputSources: {}
  };
}

function resolvedEntries(inputs = {}) {
  return Object.entries(inputs).filter(([, input]) => input && !input.missing);
}

function attachResultName(items = [], resultName) {
  return items.map((item) => ({ resultName, ...item }));
}

function resolutionErrors(inputs = {}) {
  return Object.values(inputs).flatMap((input) => input?.resolutionErrors ?? []);
}

export function recordCalculation(
  engineResult,
  resultName,
  calculationResult,
  { formula, rounding = "NONE", inputs = {}, conditions = [] } = {}
) {
  const inputErrors = resolutionErrors(inputs);
  engineResult.results[resultName] = inputErrors.length > 0 ? null : calculationResult.value;
  engineResult.errors.push(...attachResultName(calculationResult.errors, resultName));
  engineResult.errors.push(...attachResultName(inputErrors, resultName));
  engineResult.warnings.push(...attachResultName(calculationResult.warnings, resultName));
  engineResult.missingFields.push(...attachResultName(calculationResult.missingFields, resultName));
  engineResult.calculationBasis[resultName] = { formula, rounding, conditions };
  engineResult.usedInputs[resultName] = Object.fromEntries(
    resolvedEntries(inputs).map(([name, input]) => [name, input.value])
  );
  engineResult.inputSources[resultName] = Object.fromEntries(
    resolvedEntries(inputs).map(([name, input]) => [name, input.source])
  );
  return engineResult;
}

export function recordResolvedValue(
  engineResult,
  resultName,
  resolved,
  { formula = "ADOPTED_INPUT", rounding = "NONE", validation = {} } = {}
) {
  const calculationResult = resolved?.missing
    ? createMissingCalculation([resolved.field ?? resultName])
    : calculateAdoptedValue(resolved?.value, {
      ...validation,
      field: resolved?.field ?? resultName,
      monetary: rounding === "ROUND_YEN"
    });
  return recordCalculation(engineResult, resultName, calculationResult, {
    formula,
    rounding,
    inputs: { [resultName]: resolved }
  });
}

export function addEngineWarning(engineResult, resultName, field, code, message) {
  engineResult.warnings.push({ resultName, field, code, message });
  return engineResult;
}

export function appendValidation(engineResult, resultName, validation) {
  engineResult.errors.push(...attachResultName(validation.errors, resultName));
  engineResult.warnings.push(...attachResultName(validation.warnings, resultName));
  engineResult.missingFields.push(...attachResultName(validation.missingFields, resultName));
  return engineResult;
}

export function createMissingCalculation(fields) {
  return {
    value: null,
    errors: [],
    warnings: [],
    missingFields: fields.map((field) => ({
      field,
      code: "REQUIRED",
      message: `${field}は必須です。`
    }))
  };
}

export function derivedInput(value, resultName) {
  return {
    field: resultName,
    value,
    missing: value === null || value === undefined,
    source: { type: "ENGINE_RESULT", field: resultName }
  };
}
