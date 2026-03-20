# handoff

## UI文言（参考）

- **「生成用入力へ転記」は任意**。`#comic-gen-prompt-draft` が**空**のときは、`js/app.js` の **`getPromptTextForComicImageApi()`** が **4コマ統合画像プロンプト**（`#comic-unified-prompt-output`）をそのまま **「4コマ画像を生成」** に渡す。**転記なしでAPIから画像まで進められる**（文言は `index.html` / `README.md` と整合）。

## 4コマ統合画像プロンプト（実装メモ）

- **「構成を生成」** で `renderOutputs` が `#comic-unified-prompt-output` を更新する
- 統合プロンプト本文は `js/engine.js` の **`buildUnifiedComicImagePrompt`**。**タイトルテーマ**は本文冒頭の **`【入力反映】` + タイトル（`leadTitle`）** 行で必ず変化する（テーマだけ変えた場合の「前回と同じ文字列」問題の対策）
- **章/本確認用**の各ボタンは Kindle 出力のみ。統合プロンプトは **「構成を生成」** 経路で更新される想定のまま

## note記事本文（実装メモ）

- 生成は `js/engine.js` の **`buildNote`**。見出しは **導入 / 現場で起きたこと / なぜそうなったか / 気づき / まとめ**（`## 学び` は廃止）
- トーン別の導入一文は `js/templates.js` の **`noteLead`**（分析・共有のメタ文ではなく読者向けに寄せた）
- テーマ・現場に **口コミ** または **レビュー** が含まれる場合、導入・「なぜ」は **満足と口コミの別・タイミング**を説明する文に寄せる（題材の芯を保持）
- Kindle の `extractNoteBodyOutline`（`js/kindle-engine.js`）は上記見出し名に追従

## 次にやるべき1手（運用確認）

- **最優先**：実際に **note 1本のネタ**で入力 → **「構成を生成」** → **「4コマ画像を生成」**（または手入力 URL / data URL）→ **プレビュー表示** → **「4コマ画像を保存」** で `4koma-comic.png` が落ちるか、を **同一オリジン**（`cd api && npm start` → `http://127.0.0.1:8787/`）で通し確認する
- **品質調整が必要な場合**：**同一オリジンで本物画像の見え方**を確認し、**4コマ感が弱い**ときは **`js/engine.js` の `buildUnifiedComicImagePrompt`** を **最小差分で文言調整**（API は触らない方針のまま）
- **補助的な調整**：必要なら **`api/server.js` の `generateImage` 内**で前置きを足す、`quality` / `size` / `output_format` や **`OPENAI_IMAGE_MODEL`** のトレードオフを記録

※ **画像保存**はフロントの **プレビュー `img` の `src`** を利用。`data:` URL はそのまま保存。**外部オリジンの `http(s)` URL** は **CORS により `fetch` が失敗**することがある（同一オリジン API 返却・data URL は想定内）。

## 次にやるべき1手（生成後の改善フェーズ・参考）

- **同一オリジンで本物画像品質確認**：`cd api && npm start` のあと **`http://127.0.0.1:8787/`** を開き、**「4コマ画像を生成」** で **2x2・読み順・枠・キャラのブレ**を目視確認（`file://` は使わない。フォールバック時はダミーPNGのため本物評価は限定的）
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
| **URL** | フロントは **`http://127.0.0.1:8787/`**（`api` サーバが静的配信）。API は既定 **`http://127.0.0.1:8787/api/comic-image`**（`COMIC_IMAGE_API_CONFIG.url`）。本番は README 例のとおり差し替え |
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
