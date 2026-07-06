import { element } from "./dom.js";
import { enginePresentationLabel, presentationLabel, sourcePresentationLabel } from "./presentation-labels.js";

export function renderInputSources(engineResults) {
  const rows = [];
  for (const [engineId, result] of Object.entries(engineResults)) {
    for (const [resultName, sources] of Object.entries(result.inputSources ?? {})) {
      for (const [inputName, source] of Object.entries(sources ?? {})) {
        rows.push(element("tr", {}, [
          element("td", { text: enginePresentationLabel(engineId) }), element("td", { text: presentationLabel(resultName) }),
          element("td", { text: presentationLabel(inputName) }), element("td", { text: sourcePresentationLabel(source) })
        ]));
      }
    }
  }
  if (rows.length === 0) return element("p", { text: "表示できる入力出典はまだありません。" });
  return element("div", { className: "table-scroll" }, [
    element("table", { className: "result-table" }, [
      element("thead", {}, [element("tr", {}, ["分析", "結果", "使った情報", "入力元"].map((label) => element("th", { text: label, attributes: { scope: "col" } })))]),
      element("tbody", {}, rows)
    ])
  ]);
}
