import { element } from "./dom.js";
import { enginePresentationLabel, presentationLabel } from "./presentation-labels.js";

export function renderResultTables(engineResults) {
  const wrapper = element("div", { className: "result-tables" });
  for (const [engineId, result] of Object.entries(engineResults)) {
    for (const [name, value] of Object.entries(result.results ?? {})) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const keys = Object.keys(value[0]);
      const table = element("table", { className: "result-table" });
      table.append(element("thead", {}, [
        element("tr", {}, keys.map((key) => element("th", { text: presentationLabel(key, "詳細"), attributes: { scope: "col" } })))
      ]));
      table.append(element("tbody", {}, value.map((row) =>
        element("tr", {}, keys.map((key) => element("td", { text: String(row[key]) })))
      )));
      wrapper.append(element("section", { className: "table-panel" }, [
        element("h3", { text: `${enginePresentationLabel(engineId)}：${presentationLabel(name)}` }),
        element("div", { className: "table-scroll" }, [table])
      ]));
    }
  }
  return wrapper;
}
