import { element } from "./dom.js";

const NUMBER_PATTERN = /^-?(?:\d+|\d*\.\d+)$/;

export function formatAmountForConfirmation(value, unitLabel = "円") {
  const text = String(value ?? "").trim();
  if (!text || !NUMBER_PATTERN.test(text)) return "";
  const numericValue = Number(text);
  if (!Number.isFinite(numericValue)) return "";
  return `${new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 20 }).format(numericValue)}${unitLabel}`;
}

export function renderAmountConfirmation(input, unitLabel = "円") {
  const confirmation = element("small", {
    className: "amount-confirmation",
    attributes: { "aria-hidden": "true", "data-amount-confirmation": "" }
  });
  const update = () => {
    const formatted = formatAmountForConfirmation(input.value, unitLabel);
    confirmation.textContent = formatted ? `入力確認：${formatted}` : "";
    confirmation.hidden = !formatted;
  };
  input.addEventListener("input", update);
  update();
  return confirmation;
}

