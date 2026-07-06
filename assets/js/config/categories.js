export const CATEGORY_IDS = Object.freeze({
  STATUS: "status",
  OPERATING_PROFIT: "operating-profit",
  TARGET: "target",
  PRICING: "pricing",
  HIRING: "hiring",
  FINANCING: "financing",
  INVESTMENT: "investment",
  COMPARISON: "comparison"
});

const amount = (id, label, section = "simple") => ({ id, label, kind: "amount", section, unit: "金額入力単位" });
const number = (id, label, section = "simple") => ({ id, label, kind: "number", section });
const integer = (id, label, section = "simple") => ({ id, label, kind: "integer", section });
const percent = (id, label, section = "detail") => ({ id, label, kind: "percent", section, unit: "%" });

export const CATEGORIES = Object.freeze([
  {
    id: CATEGORY_IDS.STATUS,
    screenId: "SCR-101",
    title: "会社の状態を知りたい",
    description: "営業利益や財務の状態をまとめて確認します。",
    hash: "#/category/status",
    inputs: [
      amount("monthlyCashIn", "月間営業キャッシュイン"),
      amount("monthlyCashOut", "月間営業キャッシュアウト"),
      amount("monthlyLoanPayment", "月間返済支出", "detail"),
      integer("projectionMonths", "残高表示月数", "detail"),
      percent("effectiveTaxRatePercent", "実効税率（概算）")
    ]
  },
  {
    id: CATEGORY_IDS.OPERATING_PROFIT,
    screenId: "SCR-102",
    title: "営業利益を増やしたい",
    description: "売上・価格・人件費を変えたときの営業利益への影響を確認します。",
    hash: "#/category/operating-profit",
    inputs: [
      amount("salesAmount", "現在売上高"),
      amount("targetOperatingProfit", "目標営業利益"),
      amount("scenarioSalesAmount", "変更後の想定売上高"),
      amount("scenarioFixedCosts", "変更後の固定費"),
      amount("variableCosts", "現在の変動費"), amount("fixedCosts", "現在の固定費"),
      amount("customerUnitPrice", "客単価"),
      integer("customerCount", "客数"),
      amount("productUnitPrice", "商品・サービス単価"),
      amount("currentPrice", "現在価格", "detail"),
      amount("changedPrice", "変更後価格", "detail"),
      amount("unitCost", "1単位原価", "detail"),
      integer("salesQuantity", "販売数量", "detail"),
      amount("expectedSalaryPerPerson", "1人当たり想定給与", "detail"),
      integer("plannedHireCount", "採用予定人数", "detail"),
      percent("socialInsuranceRatePercent", "社会保険料率（概算）", "detail")
    ],
    costClassification: true
  },
  {
    id: CATEGORY_IDS.TARGET,
    screenId: "SCR-103",
    title: "目標を達成するには",
    description: "目標営業利益に必要な売上や数量を確認します。",
    hash: "#/category/target",
    inputs: [
      amount("targetOperatingProfit", "目標営業利益"),
      amount("requiredSalesAmount", "目標売上高"),
      amount("salesAmount", "現在売上高"), amount("variableCosts", "現在の変動費"), amount("fixedCosts", "現在の固定費"),
      amount("customerUnitPrice", "客単価"),
      amount("productUnitPrice", "商品・サービス単価"),
      amount("unitCost", "1単位原価", "detail"),
      integer("salesQuantity", "販売数量", "detail"),
      amount("fixedCostsExcludingLabor", "人件費を除く固定費", "detail"),
      amount("laborCosts", "人件費", "detail"),
      amount("otherVariableCosts", "その他変動費", "detail")
    ],
    costClassification: true
  },
  {
    id: CATEGORY_IDS.PRICING,
    screenId: "SCR-104",
    title: "商品・サービス価格",
    description: "価格変更や原価上昇の影響を確認します。",
    hash: "#/category/pricing",
    inputs: [
      amount("currentPrice", "現在価格"), amount("changedPrice", "変更後価格"),
      amount("reducedPrice", "値下げ後価格"), amount("unitCost", "1単位原価"),
      integer("salesQuantity", "販売数量"), amount("changedUnitCost", "変更後1単位原価"),
      integer("expectedQuantityAfterPriceChange", "変更後の想定販売数量"),
      amount("currentUnitCost", "現在1単位原価", "detail"),
      amount("fixedCostsExcludingLabor", "人件費を除く固定費", "detail"),
      amount("laborCosts", "人件費", "detail"), amount("otherVariableCosts", "その他変動費", "detail"),
      amount("targetOperatingProfit", "目標営業利益", "detail")
    ]
  },
  {
    id: CATEGORY_IDS.HIRING,
    screenId: "SCR-105",
    title: "人を雇った場合の影響",
    description: "採用後の人件費と営業利益への影響を確認します。",
    hash: "#/category/hiring",
    inputs: [
      integer("plannedHireCount", "採用予定人数"), amount("expectedSalaryPerPerson", "1人当たり想定給与"),
      percent("socialInsuranceRatePercent", "社会保険料率（概算）"),
      amount("expectedAdditionalSales", "採用後に見込む年間追加売上"),
      amount("currentOperatingProfit", "現在の営業利益"), percent("marginalProfitRatePercent", "限界利益率"),
      amount("targetOperatingProfit", "目標営業利益", "detail")
    ]
  },
  {
    id: CATEGORY_IDS.FINANCING,
    screenId: "SCR-106",
    title: "借入・資金繰り",
    description: "返済額と手元資金の目安を確認します。",
    hash: "#/category/financing",
    inputs: [
      amount("loanAmount", "借入金額"), percent("interestRatePercent", "年利", "simple"),
      integer("repaymentMonths", "返済月数"),
      { id: "repaymentMethod", label: "返済方法", kind: "select", section: "simple", options: [
        { value: "EQUAL_PAYMENT", label: "元利均等" }, { value: "EQUAL_PRINCIPAL", label: "元金均等" }
      ] },
      amount("annualPreDebtServiceCashFlow", "年間元利返済前キャッシュフロー"),
      amount("shortTermBorrowings", "短期借入金", "detail"), amount("longTermBorrowings", "長期借入金", "detail"),
      amount("operatingProfit", "営業利益", "detail"), amount("depreciation", "減価償却費", "detail"),
      amount("monthlyCashIn", "月間営業キャッシュイン", "detail"),
      amount("monthlyCashOut", "月間営業キャッシュアウト", "detail"),
      integer("projectionMonths", "残高表示月数", "detail")
    ]
  },
  {
    id: CATEGORY_IDS.INVESTMENT,
    screenId: "SCR-107",
    title: "投資回収",
    description: "投資回収に必要な期間と営業利益を確認します。",
    hash: "#/category/investment",
    inputs: [
      amount("investmentAmount", "投資額"),
      amount("annualIncrementalCashFlow", "年間増分キャッシュフロー"),
      amount("annualOperatingProfitBeforeInvestment", "投資前年間営業利益"),
      amount("annualOperatingProfitAfterInvestment", "投資後年間営業利益"),
      amount("annualRunningCost", "年間ランニングコスト", "detail"),
      number("targetPaybackYears", "目標回収年数", "detail")
    ]
  },
  {
    id: CATEGORY_IDS.COMPARISON,
    screenId: "SCR-108",
    title: "過年度・任意比較",
    description: "保存した2期間の変化を比較します。",
    hash: "#/category/comparison",
    inputs: [
      { id: "metric", label: "比較指標", kind: "select", section: "simple", options: [
        { value: "salesAmount", label: "売上高" },
        { value: "operatingProfit", label: "営業利益" },
        { value: "ordinaryProfit", label: "経常利益" },
        { value: "netProfit", label: "当期純利益" },
        { value: "totalAssets", label: "総資産" },
        { value: "netAssets", label: "純資産" }
      ] },
      { id: "sourcePeriodId", label: "比較元期間", kind: "period", section: "simple" },
      { id: "targetPeriodId", label: "比較先期間", kind: "period", section: "simple" }
    ]
  }
]);

export const CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CATEGORIES.map((category) => [category.id, category])));
export const CATEGORY_BY_HASH = Object.freeze(Object.fromEntries(CATEGORIES.map((category) => [category.hash, category])));
