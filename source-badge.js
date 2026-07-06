import { button, element } from "./dom.js";

export function renderPeriodSelector({ periods, selectedPeriodId, onSelect, onAdd }) {
  const select = element("select", { className: "period-select", attributes: { "aria-label": "対象期" } });
  for (const period of periods) {
    const option = element("option", { text: period.displayName || period.periodId || "名称未設定", attributes: { value: period.periodId } });
    option.selected = period.periodId === selectedPeriodId;
    select.append(option);
  }
  select.addEventListener("change", () => onSelect(select.value));
  return element("div", { className: "period-toolbar" }, [
    element("label", { text: "対象期" }), select,
    button("期を追加", onAdd, "button button--secondary")
  ]);
}
