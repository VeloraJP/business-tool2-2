import { element } from "./dom.js";
import { presentationLabel } from "./presentation-labels.js";

const LABELS = Object.freeze({
  salesAmount: "売上高", requiredCustomerCount: "必要客数", requiredSalesQuantity: "必要販売数量", dailySales: "一日当たり売上", salesPerEmployee: "一人当たり売上",
  grossProfit: "売上総利益", operatingProfit: "営業利益", ordinaryProfit: "経常利益", incomeBeforeTax: "税引前当期純利益", netProfit: "当期純利益",
  grossProfitRate: "売上総利益率", operatingProfitRate: "営業利益率", ordinaryProfitRate: "経常利益率", netProfitRate: "当期純利益率",
  marginalProfit: "限界利益", marginalProfitRate: "限界利益率", breakEvenSales: "損益分岐点売上高", marginOfSafetyRate: "安全余裕率", requiredSalesForTargetOperatingProfit: "目標営業利益達成売上高",
  currentGrossProfit: "現在の売上総利益", grossProfitAfterPriceChange: "変更後の売上総利益", requiredQuantity: "必要販売数量", grossProfitMaintenancePrice: "粗利維持価格", requiredPriceForTargetOperatingProfit: "目標営業利益達成価格",
  laborCostTotal: "人件費合計", laborCostRate: "人件費率", socialInsuranceEstimate: "社会保険料概算", additionalLaborCost: "追加人件費", laborCostAfterHiring: "採用後人件費", operatingProfitAfterHiring: "採用後営業利益", requiredAdditionalSales: "必要追加売上",
  cashBalance: "現預金", monthlyNetCashOutflow: "月間純資金流出", cashRunwayMonths: "簡易資金余命",
  monthlyPayment: "月返済額", annualPayment: "年返済額", totalPayment: "総返済額", totalInterest: "総支払利息", dscr: "DSCR", debtRepaymentYears: "債務償還年数",
  operatingProfitAfterRunningCost: "ランニングコスト反映後営業利益", paybackPeriod: "投資回収年数", roi: "ROI", requiredAnnualOperatingProfit: "必要年間営業利益",
  equityRatio: "自己資本比率", currentRatio: "流動比率", fixedAssetRatio: "固定比率", debtRatio: "負債比率", returnOnAssets: "ROA", returnOnEquity: "ROE", totalAssetTurnover: "総資産回転率", workingCapital: "運転資金",
  difference: "差額", changeRate: "増減率", compositionRate: "構成比", growthRate: "年次成長率", cagr: "CAGR",
  corporateTaxEstimate: "法人税等概算", profitAfterTax: "税引後当期純利益相当額"
});

const RATE_NAMES = new Set(["grossProfitRate", "operatingProfitRate", "ordinaryProfitRate", "netProfitRate", "marginalProfitRate", "marginOfSafetyRate", "laborCostRate", "roi", "equityRatio", "currentRatio", "fixedAssetRatio", "debtRatio", "returnOnAssets", "returnOnEquity", "operatingProfitMargin", "ordinaryProfitMargin", "netProfitMargin", "changeRate", "compositionRate", "growthRate", "cagr"]);
const COUNT_NAMES = new Set(["requiredCustomerCount", "requiredSalesQuantity", "requiredQuantity"]);
const DECIMAL_NAMES = new Set(["cashRunwayMonths", "debtRepaymentYears", "paybackPeriod", "totalAssetTurnover", "dscr"]);

const HELP = Object.freeze({
  operatingProfit: "本業の売上から売上原価と販売・管理の費用を差し引いた金額です。",
  ordinaryProfit: "本業に加えて、受取利息や支払利息なども含めた金額です。",
  netProfit: "税金などを反映した後に残る当期の金額です。",
  breakEvenSales: "営業利益が0円になる売上高の目安です。",
  cashRunwayMonths: "現在の現預金で支出をまかなえる月数の目安です。",
  dscr: "返済原資が年間返済額の何倍あるかを表します。",
  paybackPeriod: "投資額を営業利益で回収するまでの年数の目安です。",
  roi: "投資額に対して得られる営業利益の割合です。",
  equityRatio: "資産のうち、返済不要の自己資本が占める割合です。",
  currentRatio: "短期の支払いに対して流動資産がどの程度あるかを表します。",
  returnOnAssets: "総資産に対して当期純利益がどの程度あるかを表します。",
  returnOnEquity: "純資産に対して当期純利益がどの程度あるかを表します。"
});

function formatValue(name, value) {
  if (RATE_NAMES.has(name)) return `${(value * 100).toFixed(1)}%`;
  if (COUNT_NAMES.has(name)) return `${new Intl.NumberFormat("ja-JP").format(value)}`;
  if (DECIMAL_NAMES.has(name)) return value.toFixed(2);
  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}

export function renderKpis(engineResults) {
  const cards = [];
  for (const [engineId, result] of Object.entries(engineResults)) {
    for (const [name, value] of Object.entries(result.results ?? {})) {
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      cards.push(element("article", { className: "kpi-card", attributes: { "data-engine-id": engineId, "data-result-name": name } }, [
        element("span", { className: "kpi-card__label", text: LABELS[name] ?? presentationLabel(name) }),
        element("strong", { className: "kpi-card__value", text: formatValue(name, value) }),
        element("small", { text: HELP[name] ?? "入力した条件から算出した概算です。" })
      ]));
    }
  }
  if (cards.length === 0) return element("p", { className: "empty-result", text: "入力済み項目から計算できる結果はまだありません。" });
  const primary = element("div", { className: "kpi-grid" }, cards.slice(0, 4));
  if (cards.length <= 4) return primary;
  return element("div", { className: "kpi-stack" }, [
    primary,
    element("details", { className: "kpi-more" }, [
      element("summary", { text: `その他の結果を見る（${cards.length - 4}項目）` }),
      element("div", { className: "kpi-grid" }, cards.slice(4))
    ])
  ]);
}
