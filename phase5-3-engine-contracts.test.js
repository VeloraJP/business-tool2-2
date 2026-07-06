import test from "node:test";
import assert from "node:assert/strict";
import { ENGINE_IDS, runEngine } from "../../assets/js/engines/engine-runner.js";
import { ENGINE_RESULT_KEYS } from "../../assets/js/engines/contract.js";

test("共通Runnerは12 Engineを同一インターフェースで実行する", () => {
  assert.equal(Object.keys(ENGINE_IDS).length, 12);
  for (const engineId of Object.values(ENGINE_IDS)) {
    assert.deepEqual(Object.keys(runEngine(engineId)), ENGINE_RESULT_KEYS);
  }
});

test("未定義Engineも共通返却形式でErrorを返す", () => {
  const result = runEngine("forecast", {});
  assert.deepEqual(Object.keys(result), ENGINE_RESULT_KEYS);
  assert.equal(result.errors[0].code, "UNKNOWN_ENGINE");
});
