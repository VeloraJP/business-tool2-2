# Phase 3 テスト結果

- 実施日：2026年7月1日
- 対象：共通Engine、12個別Engine、共通Runner、Phase 0～2回帰
- 判定：合格

## 結果

| 検査 | 結果 |
|---|---:|
| Node自動テスト | 110件合格／失敗0 |
| Engine単体 | 12 Engine合格 |
| Formula／Calculator接続 | 合格 |
| 7項目返却契約 | 合格 |
| 共通Runner | 12 Engine登録・未定義Error合格 |
| Engine間独立性 | 直接依存0件・循環依存0件 |
| Formula・Calculator承認版差分 | 0件 |
| ブラウザ回帰 | タイトル・見出し正常、Console Error 0件 |

## 主な確認項目

- 画面MANUAL→保存MANUAL→保存AUTO→元データ→不足項目
- null・undefined・空文字列の非採用、数値0の採用
- results、errors、warnings、missingFields、calculationBasis、usedInputs、inputSources
- 一部Error・不足時の独立結果継続
- PL009非重複、固定費／変動費分類、税区分・単位・期間不一致
- 社会保険料率15%、実効税率30%、基準日2026年7月1日
- 元利均等・元金均等・最終月、ROA・ROE期末残高方式、CAGR条件
- 税引前当期純利益0以下の法人税等概算0円
- 経営状態の良否をWarningにしない
- Phase 4のRouter・View・画面ファイルなし
