import { button, element } from "../../components/dom.js";
import { renderCategoryInputs, renderCostClassifications } from "../../components/category-inputs.js";
import { renderCategoryLayout } from "../../components/category-layout.js";
import { renderResultMessages } from "../../components/result-messages.js";
import { renderResultScreen } from "../../components/result-screen.js";

const RESULT_SECTION_ORDER = Object.freeze(["この結果の意味", "前提条件", "条件を変えて確認", "詳しく見る"]);

function modeCard({ title, lead, note, action, selected, onSelect }) {
  return element("article", { className: `simulation-mode${selected ? " simulation-mode--selected" : ""}` }, [
    element("div", {}, [
      element("p", { className: "simulation-mode__lead", text: lead }),
      element("h3", { text: title }),
      element("p", { text: note })
    ]),
    button(action, onSelect, selected ? "button" : "button button--secondary")
  ]);
}

function disclosure(title, description, content, className = "") {
  return element("details", { className: `progressive-disclosure ${className}`.trim() }, [
    element("summary", {}, [
      element("span", {}, [element("strong", { text: title }), element("small", { text: description })]),
      element("span", { className: "progressive-disclosure__icon", text: "+", attributes: { "aria-hidden": "true" } })
    ]),
    element("div", { className: "progressive-disclosure__body" }, Array.isArray(content) ? content : [content])
  ]);
}

export function renderCategoryView(model, actions) {
  const mode = model.sectionId;
  const selected = mode === "simple" || mode === "detail";
  const chooseSimulation = (simulationId) => {
    actions.onInput("simulationId", simulationId);
    actions.onSelectSection("choose");
  };
  const simulationSelection = element("section", { className: "category-panel purpose-selection", attributes: { "aria-labelledby": "purpose-title" } }, [
    element("div", { className: "step-heading" }, [
      element("span", { className: "step-heading__number", text: "1" }),
      element("div", {}, [
        element("p", { className: "eyebrow", text: "知りたいことから選ぶ" }),
        element("h2", { text: "何を確認しますか？", attributes: { id: "purpose-title" } }),
        element("p", { className: "section-note", text: "1つ選ぶと、必要な入力と結果だけを表示します。" })
      ])
    ]),
    element("div", { className: "purpose-grid" }, model.simulations.map((simulation) => element("article", {
      className: `purpose-card${simulation.id === model.simulation?.id ? " purpose-card--selected" : ""}`
    }, [
      element("span", { className: "purpose-card__id", text: simulation.id.replace("SIM-", "") }),
      element("h3", { text: simulation.question }),
      element("p", { text: simulation.title }),
      button(simulation.id === model.simulation?.id ? "選択中" : "これを確認する", () => chooseSimulation(simulation.id), simulation.id === model.simulation?.id ? "button" : "button button--secondary")
    ])))
  ]);
  const fullModeSelection = element("section", { className: "category-panel mode-selection", attributes: { "aria-labelledby": "mode-title" } }, [
    element("div", { className: "step-heading" }, [
      element("span", { className: "step-heading__number", text: "2" }),
      element("div", {}, [
        element("h2", { text: "確認方法を選ぶ", attributes: { id: "mode-title" } }),
        element("p", { className: "section-note", text: "まず概算を試すか、会社データを使って詳しく確認するかを選べます。" })
      ])
    ]),
    element("div", { className: "simulation-mode-grid" }, [
      modeCard({
        title: "簡単シミュレーション", lead: "まず概算を見たい方へ",
        note: "最低限の項目だけを使います。入力内容は会社データへ保存しません。",
        action: "簡単に試す", selected: false,
        onSelect: () => actions.onSelectSection("simple")
      }),
      modeCard({
        title: "詳細シミュレーション", lead: "会社データを使って確認したい方へ",
        note: "保存済み情報を利用し、必要な情報だけを追加します。",
        action: "詳しく確認する", selected: false,
        onSelect: () => actions.onSelectSection("detail")
      })
    ])
  ]);

  const selectedModeSummary = selected ? element("section", { className: "mode-summary", attributes: { "aria-label": "選択中の目的と確認方法" } }, [
    element("div", {}, [
      element("small", { text: model.simulation?.question ?? "確認する内容" }),
      element("strong", { text: `${model.simulation?.title ?? "シミュレーション"}・${mode === "simple" ? "簡単" : "詳細"}` }),
      element("span", { text: mode === "simple" ? "最低限の入力ですぐに試せます。" : "会社データを使って詳しく確認します。" })
    ]),
    button("シミュレーションを変更", () => actions.onSelectSection("choose"), "button button--quiet")
  ]) : null;

  if (!selected) return renderCategoryLayout(model.definition, [simulationSelection, fullModeSelection]);

  const rateNote = ["SIM-11", "SIM-12"].includes(model.simulation?.id)
    ? element("p", { className: "estimate-note", text: `社会保険料率15%は2026年7月1日時点の概算値です。${mode === "detail" ? "詳細条件（必要な場合のみ）で変更できます。" : "詳細シミュレーションで変更できます。"}` })
    : model.simulation?.id === "SIM-24"
      ? element("p", { className: "estimate-note", text: "実効税率30%は2026年7月1日時点の概算値です。詳細条件（必要な場合のみ）で変更できます。" })
      : null;
  const PRIMARY_SIMPLE_FIELDS = new Set(model.simulation?.simpleInputs ?? []);
  const primaryFields = model.definition.inputs.filter(({ id }) => PRIMARY_SIMPLE_FIELDS.has(id));
  const detailFields = model.definition.inputs.filter((field) => !PRIMARY_SIMPLE_FIELDS.has(field.id));
  const simple = renderCategoryInputs(model, "simple", actions.onInput, {
    fields: primaryFields,
    title: primaryFields.length ? "必要な情報を入力" : "会社データから計算",
    note: primaryFields.length ? `この情報を入力すると「${model.simulation.title}」が分かります。` : "保存済み会社データから計算します。不足があれば結果画面で案内します。"
  });
  const detail = renderCategoryInputs(model, "detail", actions.onInput, { fields: detailFields, showHeading: false });
  const classifications = renderCostClassifications(model, actions.onClassification);
  const additionalInputs = mode === "detail"
    ? [detail, classifications].filter(Boolean)
    : [];
  const inputGroup = element("div", { className: "analysis-input-flow", attributes: { id: "analysis-inputs" } }, [
    simple,
    additionalInputs.length
      ? disclosure(mode === "detail" ? "詳細条件（必要な場合のみ）" : "入力を追加（任意）", mode === "detail" ? "条件を詳しく設定するときだけ開いてください" : "客数や単価からも確認したい場合に開きます", additionalInputs, "advanced-settings")
      : null,
    rateNote,
    element("section", { className: "calculate-step" }, [
      element("div", { className: "step-heading" }, [
        element("span", { className: "step-heading__number", text: "2" }),
        element("div", {}, [element("h2", { text: "計算する" }), element("p", { text: mode === "simple" ? "入力した値を使って計算します。" : "会社データと入力した条件を使います。" })])
      ]),
      button("計算する", actions.onCalculate, "button button--wide")
    ])
  ]);

  const children = [selectedModeSummary, inputGroup];
  if (model.hasCalculated) {
    const selectedMessages = Object.fromEntries(["errors", "warnings", "missingFields"].map((kind) => [
      kind,
      model.messages[kind].filter((item) => !item.engineId || item.engineId === model.simulation.engineId)
    ]));
    const missingCompanyField = selectedMessages.missingFields.find((item) => /^(PL|BS|MG)\d{3}$/.test(item.field ?? ""));
    const messages = renderResultMessages(selectedMessages);
    if (missingCompanyField) {
      messages.append(element("div", { className: "missing-action" }, [
        button("会社データに追加する", () => actions.onOpenCompany(missingCompanyField.field), "button button--secondary")
      ]));
    }
    children.push(renderResultScreen(model, {
      onRecalculate: () => document.querySelector("#analysis-inputs")?.scrollIntoView({ behavior: "smooth" })
    }, messages));
  }
  void RESULT_SECTION_ORDER;
  return renderCategoryLayout(model.definition, children);
}
