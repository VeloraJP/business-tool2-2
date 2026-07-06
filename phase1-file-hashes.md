# Phase 0 テスト結果

- 実施日：2026年7月1日
- 対象：financial-analysis-pwa Phase 0
- 最終結果：合格

## 1. JavaScript構文

| 対象 | 結果 |
|---|---|
| assets/js/app.js | 合格 |

## 2. Node標準テスト

| テスト | 結果 |
|---|---|
| HTMLが外部CSSとES Moduleを読み込む | 合格 |
| 本番実行経路に旧対象外ロジックがない | 合格 |
| 保持対象PWA資産が原本と一致する | 合格 |
| Phase 1以降を先行実装していない | 合格 |

最終集計：4件合格、0件失敗。

初回は、apply_patchによる改行コード差でmanifestのバイトハッシュが不一致となった。原本バイト列へ戻した後に再実行し、4件すべて合格した。内容差や実装不具合はなかった。

## 3. 静的HTTP・ブラウザ

| 項目 | 結果 |
|---|---|
| HTTP応答 | 200 |
| ページタイトル | 総合経営分析ツール Ver1.0 |
| ES Module起動 | data-app-ready=true |
| 読込stylesheet | 6件 |
| インラインstyle | 0件 |
| module script | 1件 |
| ブラウザコンソールError | 0件 |

## 4. レスポンシブ基礎

| 幅 | viewport | scrollWidth | 判定 |
|---:|---:|---:|---|
| 1280px | 1280px | 1280px | 横オーバーフローなし |
| 320px | 320px | 320px | 横オーバーフローなし |

320pxではブランドと主要カードが表示範囲内に収まり、見出しは28pxで表示された。

## 5. 原本保持

次の資産は原本SHA-256と一致した。

- manifest.webmanifest
- sw.js
- icon.svg
- apple-touch-icon.png

## 6. 未実施項目

Phase 0の対象外であるため、次は未実施とした。

- localStorage、JSON、faPro案内
- Formula、Calculator、Engine
- ハッシュルーティング
- 会社データと8カテゴリ
- PWAキャッシュ更新方式の修正
- 全指定画面幅の最終UI試験

これらは実装計画の各Phaseで実施する。

