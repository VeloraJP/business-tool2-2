# Phase 3.1 実装チェックリスト

- Phase名称：計算アーキテクチャ是正
- 実施日：2026年7月2日
- 基点：Phase 3承認版
- 基点ZIP SHA-256：`80c2ddd611af8aa7a465ec3b6ffdcac49f31c991d88707e64894ae2af0afafc2`

## 開始条件

- [x] Phase 3.1開始準備6成果物が承認済み
- [x] Phase 3.1実装開始の明示指示あり
- [x] Phase 3承認版バックアップを取得
- [x] 既存110テストが実装前に全件合格

## 実装対象

- [x] IA-01 採用済み値の検証と実端数処理
- [x] IA-02 MANUAL採用値の差異Warning抑止
- [x] IA-03 固定費／変動費の再集計
- [x] IA-04 負の純資産の許容
- [x] IA-05 共通データモデルadapterとmode整合
- [x] IA-06 税区分・単位の入力契約
- [x] IA-07 月間返済支出の0既定
- [x] IA-16 Architecture Regression Test

## 非対象・禁止領域

- [x] IA-08～IA-12を実装していない
- [x] IA-13～IA-15を実装していない
- [x] Phase 4以降へ着手していない
- [x] index.html、CSS、app.jsを変更していない
- [x] Formula、storage、Router、Viewを変更していない
- [x] manifest、Service Workerを変更していない
- [x] Ver1.0設計書凍結版25件を変更していない

## 品質確認

- [x] Engine → Calculator → Formulaの依存方向を維持
- [x] Engine共通返却形式7項目を維持
- [x] Engine間の直接依存なし
- [x] Formula／CalculatorのDOM・localStorage依存なし
- [x] 正常・異常・境界・回帰テストを追加
- [x] 全141テスト合格
- [x] JavaScript 91ファイルの構文検査合格
- [x] 変更禁止領域の差分0件

## 判定

Phase 3.1の承認対象実装は完了。Phase 4には未着手である。
