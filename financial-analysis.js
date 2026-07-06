import { VALUE_MODES } from "../config/constants.js";
import { calculateMonetaryNumbers } from "./validation.js";

export const BALANCE_SHEET_AUTO_FIELDS = Object.freeze([
  "BS005", "BS011", "BS012", "BS018",
  "BS021", "BS022", "BS026", "BS027"
]);

function storedValue(entry) {
  if (entry && typeof entry === "object" && Object.hasOwn(entry, "value")) {
    return entry.value;
  }
  return entry;
}

function adoptedValue(bs, field, calculated) {
  const entry = bs[field];
  return entry?.mode === VALUE_MODES.MANUAL ? entry.value : calculated;
}

function attachResultName(items, resultName) {
  return items.map((item) => ({ resultName, ...item }));
}

export function calculateBalanceSheetAutoValues(bs = {}) {
  const output = { results: {}, errors: [], warnings: [], missingFields: [] };

  function calculate(resultName, fields) {
    const values = fields.map((field) => storedValue(bs[field]));
    const calculation = calculateMonetaryNumbers(
      (...numbers) => numbers.reduce((sum, value) => sum + value, 0),
      Object.fromEntries(fields.map((field, index) => [field, values[index]]))
    );
    output.results[resultName] = calculation.value;
    output.errors.push(...attachResultName(calculation.errors, resultName));
    output.warnings.push(...attachResultName(calculation.warnings, resultName));
    output.missingFields.push(...attachResultName(calculation.missingFields, resultName));
    return calculation.value;
  }

  const BS005 = calculate("BS005", ["BS001", "BS002", "BS003", "BS004"]);
  const BS011 = calculate("BS011", ["BS006", "BS007", "BS008", "BS009", "BS010"]);
  bs = { ...bs, BS005: adoptedValue(bs, "BS005", BS005), BS011: adoptedValue(bs, "BS011", BS011) };
  const BS012 = calculate("BS012", ["BS005", "BS011"]);

  const BS018 = calculate("BS018", ["BS013", "BS014", "BS015", "BS016", "BS017"]);
  const BS021 = calculate("BS021", ["BS019", "BS020"]);
  bs = { ...bs, BS018: adoptedValue(bs, "BS018", BS018), BS021: adoptedValue(bs, "BS021", BS021) };
  const BS022 = calculate("BS022", ["BS018", "BS021"]);

  const BS026 = calculate("BS026", ["BS023", "BS024", "BS025"]);
  bs = {
    ...bs,
    BS012: adoptedValue(bs, "BS012", BS012),
    BS022: adoptedValue(bs, "BS022", BS022),
    BS026: adoptedValue(bs, "BS026", BS026)
  };
  calculate("BS027", ["BS022", "BS026"]);

  return output;
}
