import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES } from "../assets/js/config/categories.js";
import { formatAmountForConfirmation } from "../assets/js/components/amount-confirmation.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = (path) => readFile(join(root, path), "utf8");

test("ホーム8カテゴリの順序を維持し優先表示を追加しない", async () => {
  assert.deepEqual(CATEGORIES.map(({ id }) => id), [
    "status", "operating-profit", "target", "pricing", "hiring", "financing", "investment", "comparison"
  ]);
  const home = await source("assets/js/views/home-view.js");
  assert.match(home, /renderCategoryIcon/);
  assert.doesNotMatch(home, /迷ったときは|人気|おすすめ|ランキング|パンくず/);
});

test("正式承認された文言を表示層へ反映する", async () => {
  const category = await source("assets/js/views/categories/category-view.js");
  const company = await source("assets/js/views/company/field-view.js");
  const messages = await source("assets/js/components/result-messages.js");
  const result = await source("assets/js/components/result-screen.js");
  assert.match(category, /詳細条件（必要な場合のみ）/);
  assert.match(category, /button\("計算する"/);
  assert.match(category, /シミュレーションを変更/);
  assert.match(company, /まず入力する項目/);
  assert.match(company, /最初に入力すると分析が広がります。分かる項目から入力してください。/);
  assert.match(messages, /入力すると確認できること/);
  assert.match(messages, /会社データを保存しました/);
  assert.match(result, /button\("条件を変更"/);
});

test("AUTO・MANUAL・JSONを利用者向け表示へ置き換える", async () => {
  const modal = await source("assets/js/components/modal.js");
  const backup = await source("assets/js/components/json-data-controls.js");
  const badge = await source("assets/js/components/source-badge.js");
  assert.match(modal, /手入力した値を維持/);
  assert.match(modal, /自動計算に戻す/);
  assert.doesNotMatch(modal, /text: "(?:AUTO|MANUAL)/);
  assert.match(backup, /バックアップデータ/);
  assert.doesNotMatch(backup, /text: ".*JSON/);
  assert.match(badge, /自動計算/);
});

test("金額確認表示は入力値を変更せず3桁区切り文字列だけを返す", () => {
  assert.equal(formatAmountForConfirmation("10000000", "円"), "10,000,000円");
  assert.equal(formatAmountForConfirmation("10000", "千円"), "10,000千円");
  assert.equal(formatAmountForConfirmation("0", "円"), "0円");
  assert.equal(formatAmountForConfirmation("", "円"), "");
  assert.equal(formatAmountForConfirmation("abc", "円"), "");
});

test("中央配置と均等余白のCSS契約を持つ", async () => {
  const layout = await source("assets/css/layout.css");
  const responsive = await source("assets/css/responsive.css");
  assert.match(layout, /margin-inline: auto/);
  assert.match(layout, /padding: 22px var\(--page-gutter\) 28px/);
  assert.match(responsive, /padding-inline: 0/);
  assert.match(responsive, /--mobile-gutter/);
  assert.match(responsive, /var\(--mobile-gutter\)/);
});

