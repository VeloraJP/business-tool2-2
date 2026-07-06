import { element } from "./dom.js";
import { presentationLabel } from "./presentation-labels.js";

const RATE_RESULTS = new Set([
  "grossProfitRate", "operatingProfitRate", "ordinaryProfitRate", "netProfitRate",
  "marginalProfitRate", "marginOfSafetyRate", "laborCostRate", "roi", "equityRatio",
  "currentRatio", "fixedAssetRatio", "debtRatio", "returnOnAssets", "returnOnEquity",
  "operatingProfitMargin", "ordinaryProfitMargin", "netProfitMargin", "changeRate",
  "compositionRate", "growthRate", "cagr"
]);
const COUNT_RESULTS = new Set(["requiredCustomerCount", "requiredSalesQuantity", "requiredQuantity", "expectedQuantityAfterPriceChange"]);
const YEAR_RESULTS = new Set(["debtRepaymentYears", "paybackPeriod", "elapsedYears"]);

export function formatResultValue(name, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "計算できません";
  if (RATE_RESULTS.has(name)) return `${(value * 100).toFixed(1)}%`;
  if (name === "dscr") return `${value.toFixed(2)}倍`;
  if (name === "cashRunwayMonths") return `${value.toFixed(1)}か月`;
  if (YEAR_RESULTS.has(name)) return `${value.toFixed(1)}年`;
  if (COUNT_RESULTS.has(name)) return `${new Intl.NumberFormat("ja-JP").format(value)}`;
  if (name === "totalAssetTurnover") return `${value.toFixed(2)}回`;
  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}

export function renderResultCard(name, value, { primary = false, description = "" } = {}) {
  return element("article", {
    className: `result-card${primary ? " result-card--primary" : ""}`,
    attributes: { "data-result-name": name, "data-primary-kpi": primary ? "true" : "false" }
  }, [
    element("span", { className: "result-card__label", text: presentationLabel(name) }),
    element("strong", { className: "result-card__value", text: formatResultValue(name, value) }),
    description ? element("p", { className: "result-card__description", text: description }) : null
  ]);
}

