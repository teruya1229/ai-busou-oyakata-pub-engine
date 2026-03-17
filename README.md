# AI武装親方 出版エンジン MVP

## プロジェクト概要
現場で起きた出来事を入力すると、以下を一括で生成する静的Webツールです。
- 4コマ漫画構成
- note記事本文
- X投稿文（短文/やや長文/ハッシュタグ案）

## MVPの目的
- まず動く最小構成を優先する
- build不要の静的構成で、`index.html` を開くだけで使える状態にする
- 将来拡張しやすいように `js/app.js` `js/engine.js` `js/templates.js` に責務分離する

## ファイル構成
```text
ai-busou-oyakata-pub-engine/
├─ index.html
├─ css/style.css
├─ js/app.js
├─ js/engine.js
├─ js/templates.js
├─ ops/status.md
├─ ops/handoff.md
└─ README.md
```

## 起動方法
1. `index.html` をブラウザで開く
2. 入力欄を埋めて「構成を生成」を押す
3. 生成された3つの出力を必要に応じてコピーする

## 評価用ファイル
- 代表ケース: `samples/test-cases.js`
- 評価基準: `docs/evaluation-guide.md`
- 評価ログ: `docs/evaluation-log.md`
- 今後の品質改善は `samples/test-cases.js` の代表ケースを基準に比較しながら進める
- 品質改善の運用順は `samples/test-cases.js` -> `docs/evaluation-guide.md` -> `docs/evaluation-log.md`

## Kindle前段設計
- 章構成設計ドキュメント: `docs/kindle-bridge-design.md`
- MVP固定後は `docs/kindle-bridge-design.md` を基準に次フェーズへ進める
- chapter mapping 試作: `docs/chapter-mapping-examples.md`
- Kindle前段は `docs/kindle-bridge-design.md` と `docs/chapter-mapping-examples.md` を見ながら進める
- Kindle章テンプレ固定: `docs/kindle-chapter-template.md`
- 次フェーズは `docs/kindle-chapter-template.md` を基準に進める
- 1章分の実例原稿構成: `docs/sample-kindle-chapter-outline.md`
- 次フェーズは `docs/sample-kindle-chapter-outline.md` を見ながら原稿化ルールを詰める
- Kindle原稿化ルール初版: `docs/kindle-drafting-rules-v1.md`
- 次フェーズは `docs/kindle-drafting-rules-v1.md` を基準に進める
- 1節分サンプル本文: `docs/sample-section-drafts.md`
- 次フェーズは `docs/sample-section-drafts.md` を見ながら標準粒度を決める
- 標準粒度方針: `docs/kindle-granularity-policy-v1.md`
- 次フェーズは `docs/kindle-granularity-policy-v1.md` を基準に本文試作を進める
- 1章分本文試作 v1: `docs/sample-kindle-chapter-draft-v1.md`
- 次フェーズは `docs/sample-kindle-chapter-draft-v1.md` を見ながら原稿化ルール見直しへ進む
- 章試作レビュー反映後の原稿化ルール: `docs/kindle-drafting-rules-v1.md`（段落数目安・節末要点スタイルを微修正）
- 次フェーズは微修正後ルールで、1節または1章を再試作して読み味差を確認する
- 微修正後ルールでの1節再試作: `docs/sample-section-draft-v2.md`
- 次フェーズは `docs/sample-section-draft-v2.md` を見ながら、1章再試作へ進むか判断する
- 微修正後ルールでの1章再試作: `docs/sample-kindle-chapter-draft-v2.md`
- 次フェーズは `docs/sample-kindle-chapter-draft-v2.md` を見ながら、章テンプレと drafting rules の最終固定を判断する
- chapter draft v2 レビューを踏まえ、`docs/kindle-chapter-template.md` と `docs/kindle-drafting-rules-v1.md` の最終固定判断を実施
- 次フェーズは固定済みテンプレを前提に、量産試作または Kindle生成ルール整理へ進む
- Kindle生成ルール整理: `docs/kindle-generation-rules-v1.md`
- 次フェーズは `docs/kindle-generation-rules-v1.md` を基準に、量産試作または実装設計へ進む

## 今後の拡張候補
- 出力品質の調整（4コマテンプレ改善、note文体最適化、X投稿精度向上）
- 現場タイプ別テンプレの追加
- API差し替え可能なインターフェース整備
- 保存機能や履歴機能の追加（将来）
