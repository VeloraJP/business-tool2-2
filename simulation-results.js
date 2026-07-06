import { button, element } from "./dom.js";
import { presentationLabel } from "./presentation-labels.js";
import { renderResultCard, formatResultValue } from "./result-card.js";
import { renderSourceBadge } from "./source-badge.js";
import { renderResultTables } from "./data-table.js";
import { renderCalculationBasis } from "./calculation-basis.js";
import { renderInputSources } from "./input-sources.js";

const MEANINGS = Object.freeze({
  dscr: "年間返済額に対して、返済前の年間キャッシュフローが何倍あるかを示します。",
  debtRepaymentYears: "総有利子負債を本業の簡易返済キャッシュフローで割った年数です。",
  paybackPeriod: "投資額を年間増分キャッシュフローで回収するまでの簡易年数です。",
  roi: "投資額に対する年間増分営業利益の割合です。",
  returnOnAssets: "期末総資産に対する当期純利益の割合です。",
  returnOnEquity: "期末純資産に対する当期純利益の割合です。",
  cagr: "比較期間全体の変化を1年当たりの複利率に置き換えた値です。",
  breakEvenSales: "営業損益が0円になる売上高の目安です。",
  marginalProfitRate: "売上のうち、固定費の回収と営業利益に充てられる割合です。"
});

const CONCLUSION_PREFIX = Object.freeze({
  "SIM-01": "目標売上に必要な数量は", "SIM-02": "対象期の営業利益は", "SIM-03": "設定条件での営業利益は",
  "SIM-04": "限界利益率は", "SIM-05": "営業損益が0になる売上高は", "SIM-06": "目標営業利益に必要な売上高は",
  "SIM-07": "変更後の売上総利益は", "SIM-08": "売上総利益維持に必要な販売数量は", "SIM-09": "1単位の売上総利益額を維持する価格は",
  "SIM-10": "目標営業利益に必要な販売価格は", "SIM-11": "年間追加人件費は", "SIM-12": "採用後の営業利益は",
  "SIM-13": "初回月返済額は", "SIM-14": "年間返済額に対するキャッシュ倍率は", "SIM-15": "簡易債務償還年数は",
  "SIM-16": "簡易資金余命は", "SIM-17": "簡易投資回収年数は", "SIM-18": "簡易投資利益率は",
  "SIM-19": "総資産当期純利益率は", "SIM-20": "自己資本当期純利益率は", "SIM-21": "自己資本比率は",
  "SIM-22": "2期間の差額は", "SIM-23": "年平均成長率は", "SIM-24": "税引後利益の概算は"
});

function firstCalculated(result, names) {
  return names.map((name) => [name, result?.results?.[name]]).find(([, value]) => typeof value === "number" && Number.isFinite(value)) ?? null;
}

function conclusion(simulation, primary, engineResult) {
  if (!primary && simulation.id === "SIM-16" && (engineResult?.results?.monthlyNetCashOutflow ?? 1) <= 0) {
    return "月間純資金流出が0以下のため、現条件では現預金は減少しません。";
  }
  if (!primary) return "必要な情報を入力すると、この結果を確認できます。";
  return `${CONCLUSION_PREFIX[simulation.id] ?? `${simulation.title}は`}${formatResultValue(primary[0], primary[1])}です。`;
}

function disclosure(title, note, content) {
  return element("details", { className: "progressive-disclosure result-disclosure" }, [
    element("summary", {}, [element("span", {}, [element("strong", { text: title }), element("small", { text: note })])]),
    element("div", { className: "progressive-disclosure__body" }, [content])
  ]);
}

function assumptionBadges(engineResult) {
  const sources = Object.values(engineResult?.inputSources ?? {}).flatMap((item) => Object.values(item ?? {}));
  const unique = new Map();
  for (const source of sources) {
    const type = typeof source === "string" ? source : source?.type;
    if (type && !unique.has(type)) unique.set(type, source);
  }
  return [...unique.values()].map(renderSourceBadge);
}

export function renderResultScreen(model, actions, messages) {
  const simulation = model.simulation;
  const engineResult = model.engineResults[simulation.engineId];
  const primary = firstCalculated(engineResult, simulation.primaryResults);
  const supporting = simulation.supportingResults
    .map((name) => [name, engineResult?.results?.[name]])
    .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
    .slice(0, 3);
  const meaning = primary ? (MEANINGS[primary[0]] ?? `${presentationLabel(primary[0])}を、入力した条件から計算した結果です。`) : "入力すると確認できる内容を下に表示しています。";

  return element("section", { className: "category-panel decision-result", attributes: { "data-simulation-id": simulation.id, "aria-labelledby": "result-title" } }, [
    element("header", { className: "decision-result__header" }, [
      element("p", { className: "eyebrow", text: model.sectionId === "simple" ? "簡単シミュレーション・概算" : "詳細シミュレーション" }),
      element("h2", { text: simulation.title, attributes: { id: "result-title" } }),
      element("p", { className: "decision-result__conclusion", text: conclusion(simulation, primary, engineResult) })
    ]),
    primary ? renderResultCard(primary[0], primary[1], { primary: true, description: meaning }) : null,
    supporting.length ? element("div", { className: "supporting-kpi-grid", attributes: { "aria-label": "関連する数値" } }, supporting.map(([name, value]) => renderResultCard(name, value))) : null,
    element("section", { className: "result-meaning" }, [element("h3", { text: "この結果の意味" }), element("p", { text: meaning })]),
    element("section", { className: "result-facts" }, [
      element("h3", { text: "この結果で分かること" }),
      element("p", { text: primary ? "入力した条件での結果と、その計算前提を確認できます。" : "案内された情報を入力すると、このシミュレーション結果を確認できます。" })
    ]),
    element("section", { className: "result-assumptions" }, [
      element("h3", { text: "前提条件" }),
      element("p", { text: model.sectionId === "simple" ? "今回入力した値を使った概算です。" : "保存済み会社データと今回入力した条件を使用しています。" }),
      element("div", { className: "source-badge-row" }, assumptionBadges(engineResult))
    ]),
    messages,
    element("section", { className: "result-caution" }, [
      element("h3", { text: "注意事項" }),
      element("p", { text: "入力した前提に基づく試算です。融資・投資・採用の可否を判断するものではありません。" })
    ]),
    element("section", { className: "next-actions" }, [
      element("h3", { text: "条件を変えて確認" }),
      button("条件を変更", actions.onRecalculate, "button button--wide")
    ]),
    element("section", { className: "result-details" }, [
      element("h3", { text: "詳しく見る" }),
      disclosure("結果の詳細", "内訳や推移", renderResultTables(model.engineResults)),
      disclosure("計算根拠", "計算方法と前提", renderCalculationBasis(model.engineResults)),
      disclosure("入力元", "使った情報", renderInputSources(model.engineResults))
    ])
  ]);
}
