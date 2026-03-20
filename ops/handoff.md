# handoff

## 次にやるべき1手（どれか1つだけに絞る）
- **仕様固定**：実運用の画像生成APIの **URL・認証・レスポンス形（`imageSrc` / `dataUrl` 以外があるか）** を1枚のメモに固定し、`COMIC_IMAGE_API_CONFIG` をその前提に合わせて最小修正する
- または **ローカル画像**：ファイル選択で `FileReader.readAsDataURL` → 既存 **`applyComicImageResult`** への導線だけ追加する（fetch は触らない）

## 判断基準
- **API側の契約が固まった**なら、まず `COMIC_IMAGE_API_CONFIG.url` と **必要なヘッダ1〜2個**（例: `Authorization`）だけ足す。リトライや設定UIはまだ作らない
- **file:// で開いてCORSで詰まる**なら、同一オリジンで `index.html` を配る、またはAPIでCORSを許可する（実装範囲はインフラ次第）
- **共通**：4コマ / note / X / Kindle と `js/kindle-engine.js` を壊さない

## 注意点
- `requestComicImage` は **JSON の `imageSrc` または `dataUrl`** のみ想定。別形が返るなら **ここだけ** 正規化を足す（分岐の森にしない）
- **`normalizeComicImageResult` の `javascript:` 拒否**は維持する
- リセットは **`resetComicImagePreview`** が API ステータスと生成ボタン disabled も戻す

## 今回やらないこと
- 永続化・生成履歴の本実装
- 複数APIプロバイダの抽象層
- Kindle / note / X の変更

## 実装方針
- ルールベースMVPを維持し、Kindleは `js/kindle-engine.js`
- 画像まわりは `js/app.js` の **定数＋数関数** に留める

## 次の拡張候補
- APIキー用の入力欄1つ（localStorage は慎重に）
- 429/5xx のユーザー向け一言
- 生成結果のコピーボタン（data URL 用・注意書き付き）
