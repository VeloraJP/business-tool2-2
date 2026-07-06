import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES } from "../assets/js/config/categories.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = (path) => readFile(join(root, path), "utf8");

test("Phase 5.2は知りたいことから30秒以内に開始できる入口を維持する", async () => {
  const home = await source("assets/js/views/home-view.js");
  assert.match(home, /何を知りたいですか/);
  assert.doesNotMatch(home, /迷ったときは「会社の状態」から始める/);
  assert.match(home, /会社データは後から入力できます/);
  assert.doesNotMatch(home, /まず会社データ/);
  assert.equal(CATEGORIES.length, 8);
});

test("モード選択後は選択カードを畳み最低限入力を先に表示する", async () => {
  const view = await source("assets/js/views/categories/category-view.js");
  assert.match(view, /selectedModeSummary/);
  assert.match(view, /PRIMARY_SIMPLE_FIELDS/);
  assert.match(view, /入力を追加（任意）/);
  assert.match(view, /actions\.onSelectSection\("choose"\)/);
});

test("結果は意味・前提・条件変更・詳細の順で構成する", async () => {
  const view = await source("assets/js/views/categories/category-view.js");
  const labels = ["この結果の意味", "前提条件", "条件を変えて確認", "詳しく見る"];
  const positions = labels.map((label) => view.indexOf(label));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("会社データは主要項目だけを初期表示し追加項目と自動計算を畳む", async () => {
  const view = await source("assets/js/views/company/field-view.js");
  assert.match(view, /PRIMARY_FIELDS/);
  assert.match(view, /まず入力する項目/);
  assert.match(view, /その他の入力項目/);
  assert.match(view, /自動計算される項目/);
});

test("分析精度・スコア・断定判断・内部名を利用者向けViewへ追加しない", async () => {
  const forbidden = /分析精度|入力率|星評価|ランキング|良い会社|悪い会社|投資すべき|借りるべき|AIによる経営判断/;
  for (const directory of ["assets/js/views", "assets/js/components"]) {
    const files = (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
    for (const file of files) assert.doesNotMatch(await source(join(directory, file)), forbidden, file);
  }
});

test("Phase 5.2 UI層は計算・保存層へ直接依存しない", async () => {
  for (const directory of ["assets/js/views", "assets/js/components"]) {
    const files = (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
    for (const file of files) {
      assert.doesNotMatch(await source(join(directory, file)), /\/engines\/|\/formulas\/|\/calculators\/|\/storage\//, file);
    }
  }
});
