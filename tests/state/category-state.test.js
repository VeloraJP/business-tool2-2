import test from "node:test";
import assert from "node:assert/strict";
import { CategoryState } from "../../assets/js/state/category-state.js";

test("カテゴリ一時状態はカテゴリごとに分離される", () => {
  const state = new CategoryState();
  state.setInput("pricing", "currentPrice", "1200");
  state.setInput("investment", "investmentAmount", "500000");
  state.setCostClassification("operating-profit", "PL002", "FIXED");
  assert.equal(state.snapshot("pricing").inputs.currentPrice, "1200");
  assert.equal(state.snapshot("investment").inputs.investmentAmount, "500000");
  assert.equal(state.snapshot("operating-profit").costClassifications.PL002, "FIXED");
  assert.notStrictEqual(state.snapshot("pricing"), state.snapshot("pricing"));
});

