import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { presentationLabel, sanitizeUserText } from "../assets/js/components/presentation-labels.js";
import { CategoryState } from "../assets/js/state/category-state.js";

const root = fileURLToPath(new URL("..", import.meta.url));

async function source(path) {
  return readFile(join(root, path), "utf8");
}

test("Phase 5.1ホームは知りたいことを入口にし会社データを強制しない", async () => {
  const home = await source("assets/js/views/home-view.js");
  assert.match(home, /何を知りたいですか/);
  assert.match(home, /会社データは後から入力できます/);
  assert.doesNotMatch(home, /まず会社データを登録/);
});

test("Phase 5.1カテゴリはモード選択と1画面1目的の段階表示を持つ", async () => {
  const view = `${await source("assets/js/views/categories/category-view.js")}\n${await source("assets/js/components/category-inputs.js")}\n${await source("assets/js/components/result-screen.js")}`;
  for (const label of ["簡単シミュレーション", "詳細シミュレーション", "最低限の情報を入力", "計算する", "結果", "詳しく見る", "詳細条件", "計算根拠", "入力元"]) {
    assert.match(view, new RegExp(label), label);
  }
  assert.match(view, /progressive-disclosure/);
});

test("分析精度・入力率・スコア・断定評価をUIへ追加しない", async () => {
  const targets = ["assets/js/views", "assets/js/components"];
  const forbidden = /分析精度|入力率|星評価|ランキング|良い会社|悪い会社|投資すべき|借りるべき|AIによる経営判断/;
  for (const directory of targets) {
    const names = (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
    for (const name of names) assert.doesNotMatch(await source(join(directory, name)), forbidden, name);
  }
});

test("表示辞書は会社コードと内部変数を利用者向け日本語へ変換する", () => {
  assert.equal(presentationLabel("PL001"), "売上高");
  assert.equal(presentationLabel("BS001"), "現預金");
  assert.equal(presentationLabel("MG001"), "従業員数");
  assert.equal(presentationLabel("investmentAmount"), "投資額");
  assert.equal(sanitizeUserText("PL001とsalesAmountを確認してください。"), "売上高と売上高を確認してください。");
});

test("カテゴリは確認方法の選択から始まり、切替時に結果を初期化する", () => {
  const state = new CategoryState();
  assert.equal(state.snapshot("status").sectionId, "choose");
  state.markCalculated("status");
  assert.equal(state.snapshot("status").hasCalculated, true);
  state.setSection("status", "detail");
  assert.equal(state.snapshot("status").sectionId, "detail");
  assert.equal(state.snapshot("status").hasCalculated, false);
});

test("Phase 5.1 Viewは計算・保存層へ直接依存しない", async () => {
  for (const directory of ["assets/js/views", "assets/js/components"]) {
    const names = (await readdir(join(root, directory), { recursive: true })).filter((name) => name.endsWith(".js"));
    for (const name of names) {
      assert.doesNotMatch(await source(join(directory, name)), /\/engines\/|\/calculators\/|\/formulas\/|\/storage\//, name);
    }
  }
});
