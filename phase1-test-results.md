# Phase 1 実装チェックリスト

- Phase：1
- Phase名称：データモデル・保存基盤
- 開始日：2026年7月1日
- 開始指示：利用者より正式受領
- ベースライン：Phase 0承認版
- ベースラインSHA-256：f7bfe2317183723db6320db24384ae6acedbe141fc77ca9fbdf6a159cf8182dd

## 開始前

- [x] Phase 0が正式承認済みである
- [x] Phase 0承認版バックアップを取得した
- [x] 現在の19ファイルが承認版と一致した
- [x] Phase 1実装開始の明示指示を受けた
- [x] Phase 1の対象・非対象を確認した
- [x] 凍結仕様上の未解決事項がない
- [x] Phase 2以降へ着手しないことを確認した

## 対象

- [x] 共通定数
- [x] 正式会社項目定義
- [x] 正式スキーマと初期値
- [x] 固定費／変動費標準分類
- [x] validator
- [x] localStorage Repository
- [x] faPro検出・非移行制御
- [x] JSON 5MB上限・完全検証・原子的反映
- [x] 永続データと非永続状態の境界
- [x] 起動点への最小接続
- [x] Phase 1テスト

## 非対象

- [x] Formula・Calculator
- [x] Engine
- [x] 画面・カテゴリ
- [x] ハッシュルーティング
- [x] UI State Restore
- [x] Service Worker・manifest
- [x] Phase 2以降のテスト

## データ保護

- [x] 正式キーはmanagementAnalysis.ver1だけを使用する
- [x] faProを自動移行しない
- [x] faProを明示承認前に削除しない
- [x] 不正・失敗時に既存データを保持する
- [x] nullと0を区別する
- [x] 金額円・率小数・ISO 8601を維持する
- [x] 外部通信を追加しない

## 開始判定

判定：Phase 1実装開始可能

開始阻害事項：なし

