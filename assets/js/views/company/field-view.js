import { button, element, link } from "../../components/dom.js";
import { renderFieldControls } from "../../components/form-controls.js";
import { renderPeriodSelector } from "../../components/period-selector.js";
import { renderResultMessages } from "../../components/result-messages.js";
import { ROUTES } from "../../config/routes.js";

const PRIMARY_FIELDS = Object.freeze({
  pl: ["PL001", "PL002", "PL004", "PL005", "PL006"],
  bs: ["BS001", "BS002", "BS003", "BS013", "BS014", "BS019"],
  managementInfo: ["MG001", "MG003", "MG005", "MG006", "MG007", "MG015", "MG016"]
});

function disclosure(title, description, content) {
  if (!content) return null;
  return element("details", { className: "progressive-disclosure company-fields-disclosure" }, [
    element("summary", {}, [
      element("span", {}, [element("strong", { text: title }), element("small", { text: description })]),
      element("span", { className: "progressive-disclosure__icon", text: "+", attributes: { "aria-hidden": "true" } })
    ]),
    element("div", { className: "progressive-disclosure__body" }, [content])
  ]);
}

export function renderCompanyFieldView(model, actions, { title, collection, description }) {
  const values = collection === "managementInfo" ? model.data.companyData.managementInfo : model.period?.[collection];
  const prefix = collection === "pl" ? "PL" : collection === "bs" ? "BS" : "MG";
  const belongs = (item) => !item.field || item.field.startsWith(prefix) || item.path?.includes(collection);
  const scopedMessages = {
    ...model.messages,
    errors: model.messages.errors.filter(belongs),
    warnings: model.messages.warnings.filter(belongs),
    missingFields: model.messages.missingFields.filter(belongs)
  };
  const controlOptions = {
    values, collection,
    amountInputUnit: model.data.companyData.amountInputUnit,
    messages: scopedMessages,
    onFieldInput: actions.onFieldInput,
    onFieldChange: actions.onFieldChange,
    onModeChange: actions.onModeChange
  };
  const definitions = model.definitions[collection];
  const primaryIds = new Set(PRIMARY_FIELDS[collection] ?? []);
  const primaryDefinitions = definitions.filter(({ id }) => primaryIds.has(id));
  const otherDefinitions = definitions.filter(({ id, auto }) => !auto && !primaryIds.has(id));
  const autoDefinitions = definitions.filter(({ auto }) => auto);
  const controls = values ? [
    element("section", { className: "panel company-primary-fields" }, [
      element("h2", { text: "まず入力する項目" }),
      element("p", { className: "section-note", text: "最初に入力すると分析が広がります。分かる項目から入力してください。" }),
      renderFieldControls({ ...controlOptions, definitions: primaryDefinitions })
    ]),
    disclosure("その他の入力項目", "必要な分析で使うときに開きます", otherDefinitions.length ? renderFieldControls({ ...controlOptions, definitions: otherDefinitions }) : null),
    disclosure("自動計算される項目", "通常は入力不要です。手入力へ切り替える場合に開きます", autoDefinitions.length ? renderFieldControls({ ...controlOptions, definitions: autoDefinitions }) : null)
  ] : [element("p", { text: "対象期を追加してください。" })];

  return element("div", { className: "view company-field-view" }, [
    element("div", { className: "view-heading" }, [
      element("div", {}, [element("p", { className: "eyebrow", text: "会社データ" }), element("h1", { text: title }), element("p", { text: description }), element("p", { className: "section-note", text: "分析に必要な項目から入力できます。空欄と0は区別して保存されます。" })]),
      link("会社データへ", ROUTES.COMPANY)
    ]),
    renderResultMessages(scopedMessages),
    collection !== "managementInfo" ? renderPeriodSelector({ periods: model.data.companyData.periods, selectedPeriodId: model.selectedPeriodId, onSelect: actions.onSelectPeriod, onAdd: actions.onAddPeriod }) : null,
    ...controls,
    element("div", { className: "sticky-actions" }, [
      element("span", { className: "dirty-state", text: model.dirty ? "未保存の変更があります" : "保存済み" }),
      button("会社データを保存", actions.onSave)
    ])
  ]);
}
