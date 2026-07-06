import { button, element, link } from "../../components/dom.js";
import { renderJsonDataControls } from "../../components/json-data-controls.js";
import { renderPeriodSelector } from "../../components/period-selector.js";
import { renderResultMessages } from "../../components/result-messages.js";
import { ROUTES } from "../../config/routes.js";

function labeledInput(label, value, type, onChange) {
  const id = `meta-${label}`;
  const input = element("input", { attributes: { id, type, value: value ?? "" } });
  input.addEventListener("blur", () => onChange(input.value));
  return element("div", { className: "meta-field" }, [element("label", { text: label, attributes: { for: id } }), input]);
}

export function renderCompanyView(model, actions) {
  const { data, period, messages } = model;
  const basis = element("select", { attributes: { id: "tax-basis" } });
  basis.append(element("option", { text: "選択してください", attributes: { value: "" } }));
  for (const [label, value] of [["税込", model.taxBases.INCLUDED], ["税抜", model.taxBases.EXCLUDED]]) {
    const option = element("option", { text: label, attributes: { value } });
    option.selected = data.companyData.taxAccountingBasis === value;
    basis.append(option);
  }
  basis.addEventListener("change", () => actions.onCommon("taxAccountingBasis", basis.value || null));

  const unit = element("select", { attributes: { id: "amount-unit" } });
  for (const [label, value] of [["円", model.units.YEN], ["千円", model.units.THOUSAND_YEN], ["万円", model.units.TEN_THOUSAND_YEN]]) {
    const option = element("option", { text: label, attributes: { value } });
    option.selected = data.companyData.amountInputUnit === value;
    unit.append(option);
  }
  unit.addEventListener("change", () => actions.onCommon("amountInputUnit", unit.value));

  const periodMeta = period ? element("section", { className: "panel" }, [
    element("h2", { text: "対象期情報" }),
    element("div", { className: "meta-grid" }, [
      labeledInput("期の識別名", period.periodId, "text", (value) => actions.onPeriodMeta("periodId", value)),
      labeledInput("表示名", period.displayName, "text", (value) => actions.onPeriodMeta("displayName", value)),
      labeledInput("期首日", period.startDate, "date", (value) => actions.onPeriodMeta("startDate", value)),
      labeledInput("期末日", period.endDate, "date", (value) => actions.onPeriodMeta("endDate", value))
    ])
  ]) : null;

  const dataTools = element("details", { className: "progressive-disclosure" }, [
    element("summary", {}, [
      element("span", {}, [element("strong", { text: "データの書き出し・読み込み" }), element("small", { text: "バックアップが必要な場合に使用します" })]),
      element("span", { className: "progressive-disclosure__icon", text: "+", attributes: { "aria-hidden": "true" } })
    ]),
    element("div", { className: "progressive-disclosure__body" }, [renderJsonDataControls({ onExport: actions.onExport, onImport: actions.onImport })])
  ]);
  const companyNavigation = element("nav", { className: "company-nav", attributes: { "aria-label": "会社データ入力" } }, [
    element("a", { className: "company-nav__card", attributes: { href: ROUTES.COMPANY_PL } }, [element("strong", { text: "損益の情報" }), element("small", { text: "売上高、費用、営業利益など" })]),
    element("a", { className: "company-nav__card", attributes: { href: ROUTES.COMPANY_BS } }, [element("strong", { text: "資産・負債の情報" }), element("small", { text: "現預金、借入金、純資産など" })]),
    element("a", { className: "company-nav__card", attributes: { href: ROUTES.COMPANY_MANAGEMENT } }, [element("strong", { text: "経営の前提情報" }), element("small", { text: "従業員数、客数、目標営業利益など" })])
  ]);

  return element("div", { className: "view company-view" }, [
    element("div", { className: "view-heading" }, [element("div", {}, [element("p", { className: "eyebrow", text: "詳しい分析で再利用する情報" }), element("h1", { text: "会社データ" }), element("p", { text: "すべてを一度に入力する必要はありません。分析に必要な情報から少しずつ追加できます。" })]), link("知りたいこと一覧へ", ROUTES.HOME)]),
    renderResultMessages({ ...messages, missingFields: [] }),
    element("section", { className: "company-start" }, [
      element("div", {}, [element("h2", { text: "入力したい内容を選ぶ" }), element("p", { text: "分析中に案内された項目だけを入力してもかまいません。" })]),
      companyNavigation
    ]),
    element("section", { className: "panel" }, [
      element("h2", { text: "保存前の基本設定" }),
      element("p", { className: "section-note", text: "税込／税抜は初回保存時に選択が必要です。金額は選んだ単位で入力できます。" }),
      element("div", { className: "meta-grid" }, [
        element("div", { className: "meta-field" }, [element("label", { text: "税込／税抜", attributes: { for: "tax-basis" } }), basis]),
        element("div", { className: "meta-field" }, [element("label", { text: "金額入力単位", attributes: { for: "amount-unit" } }), unit])
      ])
    ]),
    renderPeriodSelector({ periods: data.companyData.periods, selectedPeriodId: model.selectedPeriodId, onSelect: actions.onSelectPeriod, onAdd: actions.onAddPeriod }),
    periodMeta,
    element("div", { className: "sticky-actions" }, [
      element("span", { className: "dirty-state", text: model.dirty ? "未保存の変更があります" : "保存済み" }),
      button("会社データを保存", actions.onSave)
    ]),
    dataTools
  ]);
}
