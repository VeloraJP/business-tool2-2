# Phase 2 実装チェックリスト

- Phase：2
- Phase名称：Formula・Calculator
- 開始日：2026年7月1日
- 開始指示：利用者より正式受領
- ベースライン：Phase 1承認版
- ベースラインSHA-256：0e4a0f9ac58f617a176002886b05e76d26874ae15813812bbac0e10a3bcad5bf

## 開始前

- [x] Phase 1が正式承認済みである
- [x] Phase 1承認版バックアップを取得した
- [x] 現在の45ファイルが承認版と一致した
- [x] Phase 2実装開始の明示指示を受けた
- [x] Phase 2の対象・非対象を確認した
- [x] Phase 3以降へ着手しないことを確認した

## 対象

- [x] 共通Formula・端数・単位
- [x] 共通Calculator Validation
- [x] 12分野のFormula
- [x] 12分野のCalculator
- [x] Error／Warning／missingFieldsの検証分類
- [x] 正常・異常・境界・回帰テスト

## 非対象

- [x] Engine・Engine共通返却契約
- [x] 入力優先順位・AUTO／MANUAL採用
- [x] 画面・Router・8カテゴリ
- [x] app.js接続
- [x] localStorage・スキーマ変更
- [x] manifest・Service Worker
- [x] 将来拡張Formula

## 品質

- [x] Formulaを純粋関数とする
- [x] Calculatorを副作用なしとする
- [x] DOM・localStorage・Storeへ依存させない
- [x] 共通検証・端数処理を再利用する
- [x] 正式利益区分名を使用する
- [x] 対象外機能の否定テストを行う

## 開始判定

判定：Phase 2実装開始可能

開始阻害事項：なし

## 完了結果

- [x] Formula 13ファイルを実装した
- [x] Calculator 14ファイルを実装した
- [x] JavaScript 56ファイルの構文検査が合格した
- [x] 自動テスト80件が全件合格した
- [x] アプリシェルのタイトル・見出し・コンソールError 0件を確認した
- [x] Phase 1承認版からの変更が許可範囲内である
- [x] index.html、app.js、manifest.webmanifest、sw.jsを変更していない
- [x] Phase 3以降を実装していない

完了判定：Phase 2完了

完了日：2026年7月1日
