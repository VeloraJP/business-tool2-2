import { element } from "./dom.js";
import { enginePresentationLabel, presentationLabel } from "./presentation-labels.js";

export function renderCalculationBasis(engineResults) {
  const items = [];
  for (const [engineId, result] of Object.entries(engineResults)) {
    for (const [name, basis] of Object.entries(result.calculationBasis ?? {})) {
      if (result.results?.[name] === null || result.results?.[name] === undefined) continue;
      items.push(element("details", { className: "basis-item" }, [
        element("summary", { text: `${presentationLabel(name)}の計算方法` }),
        element("dl", { className: "basis-list" }, [
          element("dt", { text: "分析" }), element("dd", { text: enginePresentationLabel(engineId) }),
          element("dt", { text: "計算" }), element("dd", { text: "表示した入力値と会社データを、定められた計算方法に当てはめています。" }),
          element("dt", { text: "端数" }), element("dd", { text: basis.rounding && basis.rounding !== "NONE" ? "仕様で定めた単位に丸めています。" : "丸めずに計算しています。" }),
          element("dt", { text: "前提" }), element("dd", { text: basis.conditions?.length ? "入力条件を満たす範囲で計算しています。" : "追加の前提条件はありません。" })
        ])
      ]));
    }
  }
  return element("div", { className: "basis-grid" }, items.length ? items : [element("p", { text: "表示できる計算根拠はまだありません。" })]);
}
