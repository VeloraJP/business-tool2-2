export const ROUTES = Object.freeze({
  HOME: "#/home",
  COMPANY: "#/company",
  COMPANY_PL: "#/company/pl",
  COMPANY_BS: "#/company/bs",
  COMPANY_MANAGEMENT: "#/company/management",
  CATEGORY_STATUS: "#/category/status",
  CATEGORY_OPERATING_PROFIT: "#/category/operating-profit",
  CATEGORY_TARGET: "#/category/target",
  CATEGORY_PRICING: "#/category/pricing",
  CATEGORY_HIRING: "#/category/hiring",
  CATEGORY_FINANCING: "#/category/financing",
  CATEGORY_INVESTMENT: "#/category/investment",
  CATEGORY_COMPARISON: "#/category/comparison"
});

export const PHASE5_ROUTE_SET = Object.freeze(new Set(Object.values(ROUTES)));
export const PHASE4_ROUTE_SET = PHASE5_ROUTE_SET;
