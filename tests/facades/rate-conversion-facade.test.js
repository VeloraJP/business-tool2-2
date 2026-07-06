import test from "node:test";
import assert from "node:assert/strict";
import { percentInputToRate, rateToPercentInput } from "../../assets/js/facades/rate-conversion-facade.js";

test("率Facadeは画面%と内部小数を相互変換する", () => {
  assert.equal(percentInputToRate(15).value, 0.15);
  assert.equal(rateToPercentInput(0.3).value, 30);
  assert.equal(percentInputToRate(0).value, 0);
  assert.equal(percentInputToRate(101).errors[0].code, "RATE_OUT_OF_RANGE");
});

