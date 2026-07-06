import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, CATEGORY_BY_HASH } from "../../assets/js/config/categories.js";
import { PHASE5_ROUTE_SET } from "../../assets/js/config/routes.js";

test("Phase 5は凍結仕様の8カテゴリだけを定義する", () => {
  assert.equal(CATEGORIES.length, 8);
  assert.deepEqual(CATEGORIES.map(({ title }) => title), [
    "会社の状態を知りたい", "営業利益を増やしたい", "目標を達成するには", "商品・サービス価格",
    "人を雇った場合の影響", "借入・資金繰り", "投資回収", "過年度・任意比較"
  ]);
  assert.equal(Object.keys(CATEGORY_BY_HASH).length, 8);
  assert.equal(PHASE5_ROUTE_SET.size, 13);
});

test("目標カテゴリに目標当期純利益を含めない", () => {
  const target = CATEGORIES.find(({ id }) => id === "target");
  assert.ok(target.inputs.some(({ id }) => id === "targetOperatingProfit"));
  assert.ok(target.inputs.every(({ id, label }) => !id.toLowerCase().includes("netprofit") && !label.includes("目標当期純利益")));
});

