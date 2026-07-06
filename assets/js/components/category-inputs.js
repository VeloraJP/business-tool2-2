import { element } from "./dom.js";
import { presentationLabel } from "./presentation-labels.js";
import { renderAmountConfirmation } from "./amount-confirmation.js";

const UNIT_LABELS = Object.freeze({ YEN: "円", THOUSAND_YEN: "千円", TEN_THOUSAND_YEN: "万円" });

function optionsFor(field, model) {
  if (field.kind === "period") {
    return model.periods.map((period) => ({ value: period.periodId, label: period.displayName || period.periodId }));
  }
  return field.options ?? [];
}

function renderInput(field, model, onInput) {
  const controlId = `category-${model.definition.id}-${field.id}`;
  const wrapper = element("div", { className: "category-input" });
  const unit = field.kind === "amount" ? UNIT_LABELS[model.amountInputUnit] : field.unit;
  wrapper.append(element("div", { className: "category-input__label" }, [
    element("label", { text: field.label, attributes: { for: controlId } }),
    unit ? element("span", { text: unit, className: "category-input__unit" }) : null
  ]));
  if (field.kind === "select" || field.kind === "period") {
    const select = element("select", { attributes: { id: controlId, name: field.id } });
    select.append(element("option", { text: "選択してください", attributes: { value: "" } }));
    for (const optionData of optionsFor(field, model)) {
      const option = element("option", { text: optionData.label, attributes: { value: optionData.value } });
      option.selected = model.inputs[field.id] === optionData.value;
      select.append(option);
    }
    select.addEventListener("change", () => onInput(field.id, select.value));
    wrapper.append(select);
    return wrapper;
  }
  const input = element("input", {
    attributes: {
      id: controlId,
      name: field.id,
      type: "number",
      step: field.kind === "integer" ? "1" : "any",
      value: model.inputs[field.id] ?? "",
      inputmode: field.kind === "integer" ? "numeric" : "decimal"
    }
  });
  input.addEventListener("input", () => onInput(field.id, input.value));
  wrapper.append(input);
  if (field.kind === "amount") wrapper.append(renderAmountConfirmation(input, unit));
  return wrapper;
}

export function renderCategoryInputs(model, section, onInput, options = {}) {
  const fields = options.fields ?? model.definition.inputs.filter((field) => field.section === section);
  if (fields.length === 0) return null;
  const content = [];
  if (options.showHeading !== false) {
    content.push(element("div", { className: "step-heading" }, [
      element("span", { className: "step-heading__number", text: options.stepLabel ?? (section === "simple" ? "1" : "詳細") }),
      element("div", {}, [
        element("h2", { text: options.title ?? (section === "simple" ? "最低限の情報を入力" : "詳細条件（必要な場合のみ）") }),
        element("p", { className: "section-note", text: options.note ?? (section === "simple" ? "空欄の項目は、利用できる会社データがあれば自動で補います。" : "必要な場合だけ追加してください。空欄は保存済み会社データを利用します。") })
      ])
    ]));
  }
  content.push(element("div", { className: "category-input-grid" }, fields.map((field) => renderInput(field, model, onInput))));
  return element("section", { className: `category-panel category-input-panel${options.showHeading === false ? " category-input-panel--nested" : ""}`, attributes: { "data-category-section": section } }, content);
}

export function renderCostClassifications(model, onChange) {
  if (!model.definition.costClassification) return null;
  const rows = Object.entries(model.standardCostClassifications).map(([field, standard]) => {
    const fieldDefinition = presentationLabel(field, "費用項目");
    const select = element("select", { attributes: { "aria-label": `${fieldDefinition}の固定費・変動費分類` } });
    for (const value of Object.values(model.costClassificationOptions)) {
      const option = element("option", { text: value === "FIXED" ? "固定費" : "変動費", attributes: { value } });
      option.selected = (model.costClassifications[field] ?? standard) === value;
      select.append(option);
    }
    select.addEventListener("change", () => onChange(field, select.value));
    return element("div", { className: "classification-row" }, [
      element("span", { text: fieldDefinition }),
      select,
      element("small", { text: model.costClassifications[field] ? "手入力" : "標準分類" })
    ]);
  });
  return element("section", { className: "category-panel" }, [
    element("h2", { text: "固定費／変動費の分類" }),
    element("p", { className: "section-note", text: "標準分類を使用します。必要な項目だけ手入力へ変更できます。" }),
    element("div", { className: "classification-list" }, rows)
  ]);
}
