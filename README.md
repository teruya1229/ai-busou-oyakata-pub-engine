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

## 今後の拡張候補
- 出力品質の調整（4コマテンプレ改善、note文体最適化、X投稿精度向上）
- 現場タイプ別テンプレの追加
- API差し替え可能なインターフェース整備
- 保存機能や履歴機能の追加（将来）
