import test from "node:test";
import assert from "node:assert/strict";
import { AMOUNT_INPUT_UNITS } from "../../assets/js/config/constants.js";
import { convertAmountInputToYen, formatYenForAmountInput } from "../../assets/js/facades/unit-conversion-facade.js";

test("Unit Facadeは既存Calculatorで円・千円・万円を円へ変換する", () => {
  assert.equal(convertAmountInputToYen(2, AMOUNT_INPUT_UNITS.YEN).value, 2);
  assert.equal(convertAmountInputToYen(2, AMOUNT_INPUT_UNITS.THOUSAND_YEN).value, 2_000);
  assert.equal(convertAmountInputToYen(2, AMOUNT_INPUT_UNITS.TEN_THOUSAND_YEN).value, 20_000);
  assert.equal(convertAmountInputToYen(2, "MILLION_YEN").errors.length, 1);
});

test("Unit Facadeは内部円値を現在入力単位の表示値へ戻す", () => {
  assert.equal(formatYenForAmountInput(20_000, AMOUNT_INPUT_UNITS.TEN_THOUSAND_YEN).value, 2);
  assert.equal(formatYenForAmountInput(null, AMOUNT_INPUT_UNITS.YEN), "");
});
