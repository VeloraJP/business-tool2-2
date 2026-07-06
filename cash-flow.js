import { MAX_IMPORT_BYTES } from "./config/constants.js";
import { CATEGORY_BY_HASH, CATEGORY_IDS } from "./config/categories.js";
import { ROUTES } from "./config/routes.js";
import { button, element } from "./components/dom.js";
import { showRecalculationConfirmation } from "./components/modal.js";
import { CompanyDataController } from "./controllers/company-data-controller.js";
import { CompanyDataIOController } from "./controllers/company-data-io-controller.js";
import { CategoryAnalysisController } from "./controllers/category-analysis-controller.js";
import { CategoryNavigationController } from "./controllers/category-navigation-controller.js";
import { HashRouter } from "./navigation/router.js";
import { removeLegacyData } from "./storage/legacy-detector.js";
import { LocalStorageRepository } from "./storage/repository.js";
import { CompanyDataStore } from "./state/store.js";
import { renderHomeView } from "./views/home-view.js";
import { renderBsView } from "./views/company/bs-view.js";
import { renderCompanyView } from "./views/company/company-view.js";
import { renderManagementView } from "./views/company/management-view.js";
import { renderPlView } from "./views/company/pl-view.js";
import { renderStatusView } from "./views/categories/status-view.js";
import { renderOperatingProfitView } from "./views/categories/operating-profit-view.js";
import { renderTargetView } from "./views/categories/target-view.js";
import { renderPricingView } from "./views/categories/pricing-view.js";
import { renderHiringView } from "./views/categories/hiring-view.js";
import { renderFinancingView } from "./views/categories/financing-view.js";
import { renderInvestmentView } from "./views/categories/investment-view.js";
import { renderComparisonView } from "./views/categories/comparison-view.js";

const APP_READY_ATTRIBUTE = "data-app-ready";
const DATA_STATE_ATTRIBUTE = "data-foundation-state";

function markApplicationReady() {
  document.body.setAttribute(APP_READY_ATTRIBUTE, "true");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service Workerの登録に失敗しました。", error);
    });
  });
}

function initializeDataFoundation() {
  const repository = new LocalStorageRepository({
    storage: window.localStorage
  });
  const store = new CompanyDataStore({
    repository,
    storage: window.localStorage
  });
  const startup = store.initialize();

  document.body.setAttribute(
    DATA_STATE_ATTRIBUTE,
    `${startup.repositoryStatus}:${startup.legacyState}`
  );

  return { store, startup };
}

function renderStartupError(error) {
  const main = document.querySelector("#app");
  main.replaceChildren(element("section", { className: "message-panel message-panel--error" }, [
    element("h1", { text: "データを読み込めませんでした" }),
    element("p", { text: error.message })
  ]));
}

function renderLegacyConfirmation(storage) {
  const main = document.querySelector("#app");
  main.replaceChildren(element("section", { className: "legacy-panel" }, [
    element("h1", { text: "旧データが見つかりました" }),
    element("p", { text: "旧版データはVer1.0へ移行できません。初期化すると旧データを削除して新規に開始します。" }),
    element("div", { className: "button-row" }, [
      button("キャンセル", () => {
        main.replaceChildren(element("section", { className: "legacy-panel" }, [
          element("h1", { text: "開始をキャンセルしました" }),
          element("p", { text: "旧データは変更されていません。Ver1.0を開始するには、再読み込み後に初期化を選択してください。" })
        ]));
      }, "button button--secondary"),
      button("旧データを初期化して開始", () => {
        removeLegacyData(storage, { confirmed: true });
        window.location.reload();
      })
    ])
  ]));
}

function downloadJson(text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "management-analysis-ver1.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function startApplication() {
  const { store, startup } = initializeDataFoundation();
  if (startup.data === null) {
    renderLegacyConfirmation(window.localStorage);
    return;
  }

  let router;
  let companyController;
  let categoryController;
  let lastRenderedRoute = null;
  const categoryNavigation = new CategoryNavigationController();
  const main = document.querySelector("#app");
  const render = () => {
    const route = router?.current() ?? ROUTES.HOME;
    const model = companyController.viewModel();
    const actions = {
      onSelectPeriod: (periodId) => companyController.selectPeriod(periodId),
      onAddPeriod: () => companyController.addPeriod(),
      onCommon: (field, value) => companyController.setCommon(field, value),
      onPeriodMeta: (field, value) => companyController.setPeriodMeta(field, value),
      onModeChange: (collection, field, mode) => companyController.setMode(collection, field, mode),
      onFieldInput: (collection, field, value) => companyController.stageField(collection, field, value),
      onFieldChange: async (collection, field, value) => {
        if (companyController.shouldConfirmRecalculation(collection, field)) {
          const decision = await showRecalculationConfirmation();
          if (decision === "RETURN_AUTO") companyController.returnManualFieldsToAuto(collection);
        }
        companyController.setField(collection, field, value);
      },
      onSave: () => {
        const saved = companyController.save();
        if (saved.ok && categoryNavigation.hasPendingReturn()) {
          const pending = categoryNavigation.consume();
          router.navigate(pending.categoryHash);
          window.setTimeout(() => window.scrollTo(0, pending.scrollY), 0);
        }
        return saved;
      },
      onExport: () => {
        try { downloadJson(ioController.exportJson()); }
        catch (error) { companyController.setExternalError(error); }
      },
      onImport: async (file) => {
        try {
          if (file.size > MAX_IMPORT_BYTES) throw Object.assign(new Error("5MBを超えるJSONファイルは読み込めません。"), { code: "FILE_TOO_LARGE" });
          if (!window.confirm("現在の正式データをJSONで上書きしますか？")) return;
          ioController.importJson(await file.text(), file.size);
        } catch (error) { companyController.setExternalError(error); }
      }
    };
    const category = CATEGORY_BY_HASH[route];
    const categoryViews = {
      [CATEGORY_IDS.STATUS]: renderStatusView,
      [CATEGORY_IDS.OPERATING_PROFIT]: renderOperatingProfitView,
      [CATEGORY_IDS.TARGET]: renderTargetView,
      [CATEGORY_IDS.PRICING]: renderPricingView,
      [CATEGORY_IDS.HIRING]: renderHiringView,
      [CATEGORY_IDS.FINANCING]: renderFinancingView,
      [CATEGORY_IDS.INVESTMENT]: renderInvestmentView,
      [CATEGORY_IDS.COMPARISON]: renderComparisonView
    };
    let view;
    if (category) {
      const categoryModel = categoryController.analyze(category.id);
      const categoryActions = {
        onInput: (field, value) => categoryController.stageInput(category.id, field, value),
        onSelectSection: (sectionId) => categoryController.selectSection(category.id, sectionId),
        onCalculate: () => categoryController.calculate(category.id),
        onClassification: (field, value) => categoryController.setCostClassification(category.id, field, value),
        onOpenCompany: (field) => {
          categoryNavigation.remember({ categoryHash: route, scrollY: window.scrollY, field });
          router.navigate(field.startsWith("PL") ? ROUTES.COMPANY_PL : field.startsWith("BS") ? ROUTES.COMPANY_BS : field.startsWith("MG") ? ROUTES.COMPANY_MANAGEMENT : ROUTES.COMPANY);
        }
      };
      view = categoryViews[category.id](categoryModel, categoryActions);
    } else view = route === ROUTES.COMPANY ? renderCompanyView(model, actions)
      : route === ROUTES.COMPANY_PL ? renderPlView(model, actions)
      : route === ROUTES.COMPANY_BS ? renderBsView(model, actions)
      : route === ROUTES.COMPANY_MANAGEMENT ? renderManagementView(model, actions)
      : renderHomeView();
    main.replaceChildren(view);
    const pendingField = categoryNavigation.peek()?.field;
    const highlightedField = !category && pendingField ? main.querySelector(`[data-field-id="${pendingField}"]`) : null;
    highlightedField?.classList.add("field-control--attention");
    if (category) window.setTimeout(() => window.scrollTo(0, categoryController.viewModel(category.id).scrollY), 0);
    else if (highlightedField) window.setTimeout(() => highlightedField.scrollIntoView({ block: "center" }), 0);
    else if (route !== lastRenderedRoute) window.setTimeout(() => window.scrollTo(0, 0), 0);
    lastRenderedRoute = route;
    main.focus({ preventScroll: true });
  };

  companyController = new CompanyDataController({ store, onChange: render });
  categoryController = new CategoryAnalysisController({ store, onChange: render });
  const ioController = new CompanyDataIOController({ store, companyController });
  router = new HashRouter({ onRoute: render });
  window.addEventListener("beforeunload", (event) => {
    if (!companyController.state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  window.addEventListener("scroll", () => {
    const category = CATEGORY_BY_HASH[router.current()];
    if (category) categoryController.setScroll(category.id, window.scrollY);
  }, { passive: true });
  router.start();
}

try {
  startApplication();
} catch (error) {
  document.body.setAttribute(DATA_STATE_ATTRIBUTE, "ERROR");
  renderStartupError(error);
}

markApplicationReady();
registerServiceWorker();
