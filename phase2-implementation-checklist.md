# Phase 1 テスト結果

- 実施日：2026年7月1日
- 対象：Phase 1 データモデル・保存基盤
- 最終結果：合格

## 1. 自動テスト

- テスト総数：47件
- 合格：47件
- 失敗：0件
- スキップ：0件

### 分野別

| 分野 | 主な確認内容 | 結果 |
|---|---|---|
| 定数 | 保存キー、版、最大3期、5MB、enum | 合格 |
| 会社項目 | CM 2件、PL 25件、BS 27件、MG 16件 | 合格 |
| AUTO項目 | PL 7件、BS 8件、value／mode | 合格 |
| 費用分類 | 固定費／変動費、PL009除外 | 合格 |
| スキーマ | 初期値、期、税区分、単位、初期化 | 合格 |
| validator | null／0、負数、日付、mode、未知項目 | 合格 |
| Repository | save／load／clear、破損、容量超過 | 合格 |
| 旧データ | 存在組合せ、非移行、承認削除 | 合格 |
| JSON | UTF-8、5MB境界、原子性、版拒否 | 合格 |
| Store | 新規、旧版、セッション非永続 | 合格 |
| Phase 0回帰 | 資産分離、PWA保持、対象外非混入 | 合格 |

## 2. JavaScript構文

- 対象ファイル：10件
- 構文エラー：0件

## 3. ブラウザ起動

| 項目 | 1280px | 320px |
|---|---:|---:|
| data-app-ready | true | true |
| data-foundation-state | EMPTY:EMPTY | EMPTY:EMPTY |
| viewport幅 | 1280 | 320 |
| scrollWidth | 1280 | 320 |
| コンソールError | 0件 | 0件 |

新規利用時にmanagementAnalysis.ver1を自動保存せず、初期データはメモリだけに生成することをStoreテストで確認した。

## 4. データ保護

- 不正保存時に既存値保持：合格
- JSON破損時に無断削除なし：合格
- 容量超過時に既存値保持：合格
- faPro自動移行なし：合格
- faPro明示承認前削除なし：合格
- 5MB超Error：合格
- schemaVersion不一致拒否：合格
- 一時状態の正式データ混入なし：合格

## 5. 対象外確認

- Formula：0ファイル
- Calculator：0ファイル
- Engine：0ファイル
- Navigation：0ファイル
- View：0ファイル
- 対象外機能トークン：0件
- Phase 1モジュール内の外部通信API：0件

## 6. 回帰

manifest.webmanifest、sw.js、icon.svg、apple-touch-icon.pngは原本ハッシュと一致した。index.htmlとCSSはPhase 0承認版から変更していない。

