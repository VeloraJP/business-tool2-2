import { BS_FIELDS, MANAGEMENT_FIELDS, PL_FIELDS } from "../data/company-fields.js";

const COMPANY_LABELS = Object.freeze(Object.fromEntries(
  [...PL_FIELDS, ...BS_FIELDS, ...MANAGEMENT_FIELDS].map(({ id, label }) => [id, label])
));

const LABELS = Object.freeze({
  ...COMPANY_LABELS,
  salesAmount: "売上高", customerUnitPrice: "客単価", customerCount: "客数",
  productUnitPrice: "商品・サービス単価", salesQuantity: "販売数量", businessDays: "営業日数",
  employeeCount: "従業員数", requiredSalesAmount: "必要売上高", requiredCustomerCount: "必要客数",
  requiredSalesQuantity: "必要販売数量", dailySales: "一日当たり売上", salesPerEmployee: "一人当たり売上",
  costOfSales: "売上原価", grossProfit: "売上総利益", operatingProfit: "営業利益",
  ordinaryProfit: "経常利益", incomeBeforeTax: "税引前当期純利益", netProfit: "当期純利益",
  corporateTax: "法人税等", grossProfitRate: "売上総利益率", operatingProfitRate: "営業利益率",
  ordinaryProfitRate: "経常利益率", netProfitRate: "当期純利益率", targetOperatingProfit: "目標営業利益",
  variableCosts: "変動費", fixedCosts: "固定費", marginalProfit: "限界利益",
  marginalProfitRate: "限界利益率", breakEvenSales: "損益分岐点売上高", marginOfSafetyRate: "安全余裕率",
  requiredSalesForTargetOperatingProfit: "目標営業利益達成売上高", currentPrice: "現在価格",
  scenarioSalesAmount: "変更後の想定売上高", scenarioFixedCosts: "変更後の固定費", scenarioOperatingProfit: "シナリオ営業利益",
  changedPrice: "変更後価格", reducedPrice: "値下げ後価格", unitCost: "1単位原価",
  changedUnitCost: "変更後1単位原価", currentUnitCost: "現在1単位原価", requiredQuantity: "必要販売数量",
  expectedQuantityAfterPriceChange: "変更後の想定販売数量", unitCostAfterPriceChange: "変更後1単位原価",
  currentGrossProfit: "現在の売上総利益", grossProfitAfterPriceChange: "変更後の売上総利益",
  grossProfitMaintenancePrice: "粗利維持価格", requiredPriceForTargetOperatingProfit: "目標営業利益達成価格",
  executiveCompensation: "役員報酬", salaries: "給与手当", statutoryBenefits: "法定福利費",
  laborCosts: "人件費", currentLaborCosts: "現在の人件費", laborCostTotal: "人件費合計",
  laborCostRate: "人件費率", socialInsuranceEstimate: "社会保険料概算", socialInsuranceRate: "社会保険料率",
  socialInsuranceRatePercent: "社会保険料率（概算）", expectedSalaryPerPerson: "1人当たり想定給与",
  plannedHireCount: "採用予定人数", additionalLaborCost: "追加人件費", laborCostAfterHiring: "採用後人件費",
  operatingProfitAfterHiring: "採用後営業利益", requiredAdditionalSales: "必要追加売上",
  expectedAdditionalSales: "採用後に見込む年間追加売上", currentOperatingProfit: "現在の営業利益",
  fixedCostsExcludingLabor: "人件費を除く固定費", otherVariableCosts: "その他変動費",
  cashBalance: "現預金", monthlyCashIn: "月間営業キャッシュイン", monthlyCashOut: "月間営業キャッシュアウト",
  monthlyLoanPayment: "月間返済支出", monthlyNetCashOutflow: "月間純資金流出", cashRunwayMonths: "簡易資金余命",
  projectionMonths: "残高表示月数", loanAmount: "借入金額", interestRate: "年利", interestRatePercent: "年利",
  repaymentMonths: "返済月数", repaymentMethod: "返済方法", repaymentSource: "返済原資",
  annualPreDebtServiceCashFlow: "年間元利返済前キャッシュフロー", shortTermBorrowings: "短期借入金",
  longTermBorrowings: "長期借入金", depreciation: "減価償却費", totalInterestBearingDebt: "総有利子負債",
  simpleRepaymentCashFlow: "簡易返済キャッシュフロー",
  monthlyPayment: "月返済額", annualPayment: "年返済額", totalPayment: "総返済額",
  totalInterest: "総支払利息", dscr: "DSCR", debtRepaymentYears: "債務償還年数",
  investmentAmount: "投資額", annualOperatingProfitBeforeInvestment: "投資前年間営業利益",
  annualOperatingProfitAfterInvestment: "投資後年間営業利益", annualRunningCost: "年間ランニングコスト",
  operatingProfitAfterRunningCost: "ランニングコスト反映後営業利益", targetPaybackYears: "目標回収年数",
  paybackPeriod: "投資回収年数", roi: "ROI", requiredAnnualOperatingProfit: "必要年間営業利益",
  annualIncrementalCashFlow: "年間増分キャッシュフロー", annualIncrementalOperatingProfit: "年間増分営業利益",
  currentAssets: "流動資産", fixedAssets: "固定資産", totalAssets: "資産合計",
  currentLiabilities: "流動負債", fixedLiabilities: "固定負債", totalLiabilities: "負債合計",
  netAssets: "純資産", liabilitiesAndNetAssets: "負債純資産合計", equityRatio: "自己資本比率",
  currentRatio: "流動比率", fixedAssetRatio: "固定比率", debtRatio: "負債比率",
  returnOnAssets: "ROA", returnOnEquity: "ROE", totalAssetTurnover: "総資産回転率", workingCapital: "運転資金",
  sourceValue: "比較元の値", targetValue: "比較先の値", previousValue: "前期の値", currentValue: "当期の値",
  itemValue: "構成項目", totalValue: "構成合計", difference: "差額", changeRate: "増減率",
  compositionRate: "構成比", growthRate: "年次成長率", cagr: "CAGR", periods: "比較期間",
  sourcePeriodId: "比較元期間", targetPeriodId: "比較先期間", metric: "比較指標", years: "経過年数",
  sourcePeriodEnd: "比較元期末日", targetPeriodEnd: "比較先期末日", elapsedYears: "経過年数",
  effectiveTaxRate: "実効税率", effectiveTaxRatePercent: "実効税率（概算）",
  corporateTaxEstimate: "法人税等概算", profitAfterTax: "税引後当期純利益相当額",
  taxAccountingBasis: "税込／税抜区分", amountInputUnit: "金額入力単位", periodId: "対象期",
  paymentNumber: "回数", payment: "返済額", principal: "元金", interest: "利息", balance: "返済後残高",
  month: "月", value: "金額"
});

const ENGINE_LABELS = Object.freeze({
  sales: "売上分析", profit: "損益分析", "break-even": "損益分岐点分析", pricing: "価格分析",
  "labor-cost": "人件費分析", "cash-flow": "資金繰り分析", "loan-repayment": "借入返済分析",
  "investment-return": "投資回収分析", "financial-analysis": "財務分析", comparison: "比較分析",
  growth: "成長率分析", tax: "税金概算"
});

const SOURCE_LABELS = Object.freeze({
  SCREEN_MANUAL: "今回の入力", SAVED_MANUAL: "会社データ（手入力）", SAVED_AUTO: "会社データ（自動計算）",
  DERIVED: "入力内容から計算", ENGINE_RESULT: "ほかの計算結果", DEFAULT: "標準値"
});

const BENEFIT_LABELS = Object.freeze({
  PL001: "売上の伸びや一人当たり売上", PL002: "売上総利益や営業利益", PL004: "人件費を含む営業利益",
  PL005: "人件費を含む営業利益", PL006: "人件費と社会保険料の影響", PL008: "固定費を含む損益分岐点",
  PL010: "固定費を含む損益分岐点", PL011: "費用を含む営業利益", PL012: "費用を含む営業利益",
  PL013: "減価償却費を含む営業利益", PL014: "その他固定費を含む損益分岐点", PL015: "変動費を含む損益分岐点",
  BS001: "簡易資金余命", BS012: "ROAや総資産回転率", BS018: "流動比率", BS022: "負債比率",
  BS026: "自己資本比率やROE", MG001: "一人当たり売上", MG003: "一日当たり売上",
  MG005: "客数から見た売上", MG006: "客単価から見た売上", MG007: "販売数量から見た売上",
  MG015: "目標営業利益の達成条件", MG016: "目標売上高との比較"
});

export function presentationLabel(value, fallback = "計算項目") {
  if (LABELS[value] ?? COMPANY_LABELS[value]) return LABELS[value] ?? COMPANY_LABELS[value];
  const companyCode = String(value ?? "").match(/(?:PL|BS|MG|CM)\d{3}/)?.[0];
  return COMPANY_LABELS[companyCode] ?? fallback;
}

export function enginePresentationLabel(value) {
  return ENGINE_LABELS[value] ?? "分析結果";
}

export function sourcePresentationLabel(source) {
  if (!source) return "入力情報";
  if (typeof source === "string") return SOURCE_LABELS[source] ?? "入力情報";
  const type = SOURCE_LABELS[source.type] ?? (source.engineId ? "ほかの計算結果" : "入力情報");
  const field = presentationLabel(source.field ?? source.resultName, "");
  return field ? `${type}：${field}` : type;
}

export function sanitizeUserText(value, fallback = "入力内容を確認してください。") {
  if (!value) return fallback;
  let text = String(value);
  for (const [internal, label] of Object.entries(LABELS).sort(([a], [b]) => b.length - a.length)) {
    text = text.replaceAll(internal, label);
  }
  text = text.replace(/\b(?:PL|BS|MG|CM)\d{3}\b/g, "入力項目");
  text = text.replace(/\b[A-Za-z][A-Za-z0-9]*(?:[A-Z][A-Za-z0-9]*)+\b/g, "入力項目");
  return text;
}

export function missingBenefit(item) {
  const label = presentationLabel(item?.field ?? item?.path, "追加情報");
  const companyCode = String(item?.field ?? item?.path ?? "").match(/(?:PL|BS|MG)\d{3}/)?.[0];
  const result = BENEFIT_LABELS[companyCode] ?? presentationLabel(item?.resultName, "ほかの関連結果");
  return `${label}を入力すると、${result}を確認できます。`;
}
