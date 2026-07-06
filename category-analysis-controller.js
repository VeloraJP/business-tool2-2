import { element } from "./dom.js";

const SOURCE_BADGES = Object.freeze({
  SCREEN_MANUAL: ["入力値", "input"],
  SAVED_MANUAL: ["会社データ", "company"],
  SAVED_AUTO: ["自動計算", "auto"],
  DERIVED_SOURCE: ["自動計算", "auto"],
  DERIVED: ["自動計算", "auto"],
  ENGINE_RESULT: ["自動計算", "auto"],
  DEFAULT: ["標準値", "standard"]
});

export function renderSourceBadge(source) {
  const type = typeof source === "string" ? source : source?.type;
  const [label, modifier] = SOURCE_BADGES[type] ?? ["入力情報", "neutral"];
  return element("span", {
    className: `source-badge source-badge--${modifier}`,
    text: label,
    attributes: { "data-source-type": type ?? "UNKNOWN" }
  });
}
