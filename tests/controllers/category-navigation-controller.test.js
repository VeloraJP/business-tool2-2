import test from "node:test";
import assert from "node:assert/strict";
import { CategoryNavigationController } from "../../assets/js/controllers/category-navigation-controller.js";

test("不足項目往復情報は一度だけ消費する", () => {
  const controller = new CategoryNavigationController();
  controller.remember({ categoryHash: "#/category/status", sectionId: "results", scrollY: 240, field: "PL001" });
  assert.equal(controller.hasPendingReturn(), true);
  assert.deepEqual(controller.consume(), { categoryHash: "#/category/status", sectionId: "results", scrollY: 240, field: "PL001" });
  assert.equal(controller.consume(), null);
});

