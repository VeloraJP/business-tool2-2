# Phase 3 実装チェックリスト

- Phase：3
- Phase名称：共通Engine・12個別Engine
- 開始日：2026年7月1日
- 開始指示：利用者より正式受領
- ベースライン：Phase 2承認版
- ベースラインSHA-256：68e3692d959486c25c037884a4979f546683de8ffb625955a0429b23226f46b4

## 開始前

- [x] Phase 2が正式承認済みである
- [x] Phase 2承認版バックアップを取得した
- [x] 現在の82ファイルが承認版と一致した
- [x] Phase 3実装開始の明示指示を受けた
- [x] Formula・Calculatorを変更しないことを確認した
- [x] Phase 4以降へ着手しないことを確認した

## 対象

- [x] 共通返却契約
- [x] 入力解決器
- [x] 12個別Engine
- [x] Calculator接続
- [x] 部分計算・独立実行
- [x] Engine単体・接続・独立性・回帰テスト

## 非対象

- [x] Formula・Calculator変更
- [x] 画面・Router・8カテゴリ
- [x] app.js接続
- [x] localStorage・スキーマ変更
- [x] manifest・Service Worker
- [x] Phase 4以降

## 完了結果

- [x] 7項目の共通返却契約を実装した
- [x] 5段階入力優先順位を実装した
- [x] 12 Engineと共通Runnerを実装した
- [x] Formula・Calculatorの承認版差分0件を確認した
- [x] Engine間直接依存0件を確認した
- [x] 自動テスト110件が全件合格した
- [x] ブラウザConsole Error 0件を確認した
- [x] Phase 4ファイル0件を確認した

完了判定：Phase 3完了

完了日：2026年7月1日
