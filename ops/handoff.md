# handoff

## 次にやるべき1手（生成後の改善フェーズ）

- **本物画像での品質確認（最優先）**：課金・quota が通る状態で **「4コマ画像を生成」** を実行し、**2x2・読み順・枠・キャラのブレ**を目視確認する（フォールバック時はダミーPNGのため本物評価は限定的）
- **4コマ感が弱い場合**：まず **`js/engine.js` の `buildUnifiedComicImagePrompt`** の共通指示を **最小差分で文言調整**（API・フロントは触らない方針のまま）
- **補助的な調整**：必要なら **`api/server.js` の `generateImage` 内**で前置きを足す、`quality` / `size` / `output_format` や **`OPENAI_IMAGE_MODEL`** のトレードオフを記録

※ **API サーバの土台**（`POST /api/comic-image`・`{ imageSrc }`）と **フロント接続**は揃っている。統合プロンプトの質は **`buildUnifiedComicImagePrompt`**、サーバ側は **`generateImage()`** が主な調整点。

## 判断基準

- **まず動かす**なら `api/.env` のキーと `cd api && npm start` だけ確認
- **モデル名エラー**（`gpt-image-1.5` 未提供等）なら **`OPENAI_IMAGE_MODEL=gpt-image-1`** 等へ一時変更し、公式の利用可能モデルに合わせる
- **共通**：4コマ / note / X / Kindle と `js/kindle-engine.js` を壊さない（フロントは触らない方針のまま）

## 注意点

- **`OPENAI_API_KEY` はリポジトリにコミットしない**（`api/.env` は Git 無視、`api/.env.example` のみテンプレ）
- **`USE_DUMMY = true`** に戻すと **キーなしでダミー画像**のみ返却（疎通確認用）
- **`USE_DUMMY = false`（既定）** かつ OpenAI が失敗した場合は **500 ではなくダミー画像へフォールバック**（`imageSrc` は常に data URL）。サーバログに **OpenAI失敗 / ダミーへフォールバック**（キー未設定時は1行）。任意 **`fallback: true`**。本番で厳格エラーに戻す場合は **`api/server.js`** の該当分岐を変更

## 実API接続・仕様確認チェックリスト（差し替え指針）

| 観点 | 現状（コード上の事実） |
|------|------------------------|
| **URL** | 既定 **`http://127.0.0.1:8787/api/comic-image`**（`COMIC_IMAGE_API_CONFIG.url`）。本番は README 例のとおり差し替え |
| **HTTP method** | `POST` 固定 |
| **request body** | `JSON.stringify({ prompt: promptText })` |
| **認証** | フロントはなし。サーバは **`OPENAI_API_KEY`**（`api/.env`） |
| **response JSON** | トップレベル **`imageSrc`**（`data:image/png;base64,...`） |

## 今回やらないこと

- フロントの大規模改修
- 複数ベンダプロバイダの抽象層
- Kindle / note / X の変更

## 実装方針

- ルールベースMVPを維持し、Kindleは `js/kindle-engine.js`
- 画像まわりは **`api/server.js` の `generateImage`** を中心に拡張

## 次の拡張候補

- 429/5xx のユーザー向け一言（サーバ）
- 生成結果のログ（開発時のみ）
