# 総合経営分析ツール Ver1.0

## 現在の実装状態

Phase 3として、Phase 2までのデータ・計算基盤に加え、共通Engine契約とVer1.0対象の12 Engineを実装しています。

画面遷移、会社データ入力画面、8カテゴリはPhase 4以降で実装します。Phase 3では先行実装していません。

## 構成

- index.html：最小アプリシェル
- assets/css：デザイントークン、基本、レイアウト、部品、レスポンシブ、印刷
- assets/js/config：保存キー、バージョン、enum、上限値
- assets/js/data：正式項目定義、初期スキーマ、標準費用分類
- assets/js/storage：検証、Repository、JSON、旧データ検出
- assets/js/state：永続データとセッション状態の境界
- assets/js/formulas：副作用を持たない共通・分野別計算式
- assets/js/calculators：入力検証、単位確認、最終端数処理、Formula呼出し
- assets/js/engines：入力優先順位、共通返却契約、12 Engine、共通Runner
- assets/js/app.js：ES Modules起動点とデータ基盤初期化
- tests：Phase 0～2回帰、Formula・Calculator・Engineの正常・境界・異常テスト
- manifest.webmanifest：既存PWA情報。Phase 8でVer1.0へ更新予定
- sw.js：既存Service Worker。Phase 8でキャッシュ方式を更新予定
- icon.svg／apple-touch-icon.png：既存アイコン

## テスト

Node.jsで次を実行します。

    npm test

または、構文検査を含めて次を実行します。

    npm run check

## 運用上の注意

- Ver1.0設計書凍結版を唯一の実装基準とします。
- 旧版原本はバックアップで保全し、本番実行経路へ接続しません。
- 旧faProデータは自動移行・自動削除しません。
- 正式保存キーはmanagementAnalysis.ver1です。
- Phase 4以降の機能は、該当Phase開始前チェック後に実装します。
- manifestとService Workerの更新は実装計画どおりPhase 8で行います。
