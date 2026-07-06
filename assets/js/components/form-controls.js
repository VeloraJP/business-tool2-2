import { VALUE_MODES } from "../config/constants.js";
import { formatYenForAmountInput } from "../facades/unit-conversion-facade.js";
import { element } from "./dom.js";
import { sanitizeUserText } from "./presentation-labels.js";
import { renderAmountConfirmation } from "./amount-confirmation.js";

const UNIT_LABELS = Object.freeze({ YEN: "円", THOUSAND_YEN: "千円", TEN_THOUSAND_YEN: "万円" });

function fieldIssues(messages, field) {
  return [...messages.errors, ...messages.warnings, ...messages.missingFields]
    .filter((item) => item.field === field || item.path?.endsWith(`.${field}`));
}

export function renderFieldControls({ definitions, values, collection, amountInputUnit, messages, onFieldInput, onFieldChange, onModeChange }) {
  const grid = element("div", { className: "field-grid" });
  for (const definition of definitions) {
    const stored = values[definition.id];
    const isAuto = definition.auto;
    const mode = isAuto ? stored.mode : null;
    const internalValue = isAuto ? stored.value : stored;
    const display = definition.kind === "amount"
      ? formatYenForAmountInput(internalValue, amountInputUnit)
      : { value: internalValue ?? "" };
    const issues = fieldIssues(messages, definition.id);
    const controlId = `field-${collection}-${definition.id}`;
    const input = element("input", {
      className: "field-control__input",
      attributes: {
        id: controlId,
        name: definition.id,
        type: "number",
        step: definition.kind === "integer" ? "1" : "any",
        value: display.value ?? "",
        readonly: isAuto && mode === VALUE_MODES.AUTO ? "" : null,
        "aria-invalid": issues.some(({ code }) => code !== "REQUIRED") ? "true" : "false",
        "aria-describedby": issues.length ? `${controlId}-message` : null
      }
    });
    input.addEventListener("input", () => onFieldInput(collection, definition.id, input.value));
    input.addEventListener("blur", () => onFieldChange(collection, definition.id, input.value));

    const header = element("div", { className: "field-control__header" }, [
      element("label", { text: definition.label, attributes: { for: controlId } }),
      element("span", { className: "field-control__unit", text: definition.unit ?? (definition.kind === "amount" ? UNIT_LABELS[amountInputUnit] : "") })
    ]);
    const body = element("div", { className: "field-control__body" }, [input]);
    if (isAuto) {
      const select = element("select", { className: "mode-select", attributes: { "aria-label": `${definition.label}の入力モード` } });
      for (const value of Object.values(VALUE_MODES)) {
        const option = element("option", { text: value === VALUE_MODES.AUTO ? "自動計算" : "手入力", attributes: { value } });
        option.selected = value === mode;
        select.append(option);
      }
      select.addEventListener("change", () => onModeChange(collection, definition.id, select.value));
      body.append(select);
    }
    if (definition.kind === "amount") body.append(renderAmountConfirmation(input, UNIT_LABELS[amountInputUnit]));
    const card = element("div", {
      className: `field-control${issues.length ? " field-control--attention" : ""}`,
      attributes: { "data-field-id": definition.id }
    }, [header, body]);
    if (issues.length) {
      const message = issues[0].code === "REQUIRED"
        ? "入力すると、関連する分析に利用できます。"
        : sanitizeUserText(issues[0].message);
      card.append(element("p", { className: "field-control__message", text: message, attributes: { id: `${controlId}-message` } }));
    }
    grid.append(card);
  }
  return grid;
}
