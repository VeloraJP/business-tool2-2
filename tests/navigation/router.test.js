import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES } from "../../assets/js/config/routes.js";
import { HashRouter, normalizePhase4Hash, normalizePhase5Hash } from "../../assets/js/navigation/router.js";

test("Phase 5はhome・会社データ・8カテゴリのハッシュだけを許可する", () => {
  assert.equal(normalizePhase4Hash(ROUTES.COMPANY_PL), ROUTES.COMPANY_PL);
  assert.equal(normalizePhase5Hash(ROUTES.CATEGORY_STATUS), ROUTES.CATEGORY_STATUS);
  assert.equal(normalizePhase5Hash("#/category/forecast"), ROUTES.HOME);
  assert.equal(normalizePhase5Hash(""), ROUTES.HOME);
});

test("HashRouterは現在ルートを通知する", () => {
  const listeners = new Map();
  const location = { hash: ROUTES.COMPANY, replace(value) { this.hash = value; } };
  const browserWindow = {
    location,
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); }
  };
  const routes = [];
  const router = new HashRouter({ browserWindow, onRoute: (route) => routes.push(route) });
  router.start();
  assert.deepEqual(routes, [ROUTES.COMPANY]);
  router.navigate(ROUTES.COMPANY_BS);
  listeners.get("hashchange")();
  assert.equal(routes.at(-1), ROUTES.COMPANY_BS);
});
