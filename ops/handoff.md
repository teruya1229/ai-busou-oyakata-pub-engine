# handoff

## UI文言（参考）

- **出力スタイル**（`index.html`）: **指定なし**は従来どおり。**note向け / 4コマ向け / Kindle向け**は `js/app.js` の `getInputFromForm()` で `outputStyle` を渡し、`js/engine.js` の `normalizeInput` → `buildNote` / `buildComic` / `buildUnifiedComicImagePrompt` の寄せ方が変わる
- **用途別コピー**: 入力フォーム直下の **用途別コピー（生成後）** から、**note本文 / 4コマ構成 / 4コマ統合プロンプト / Kindle節素材**を個別コピー。**スタイル向けにまとめてコピー**は `copyStyleBundle()`（`js/app.js`）で `outputStyle` に応じた連結。各出力ブロック横のボタン文言も用途が分かる表記に揃えている
- **4コマ画像（有料API）**: 統合プロンプト欄の下に **最終確認**（入力要約・芯・出力スタイル・note寄せ方・4コマ構成・`getPromptTextForComicImageApi()` と同じ送信プロンプト）。ボタンは **この内容で4コマ画像を生成**。送信直前に **今回使った生成用プロンプト**欄へ同じ文字列を表示。`requestComicImage` / API 本文は未変更
- **note本文の寄せ方**（`notePreset`）: **出力スタイル（`outputStyle`）とは別**。`js/engine.js` の `normalizeInput` に `notePreset`（`strong` / `soft` / `biz`、未指定は標準）。`buildNote` 系の **導入・反転の接続・締め**と、口コミ系の **冒頭一文**、トーン導入の **短文サフィックス**だけを差し替え。4コマ・統合プロンプトは未変更
- **「生成用入力へ転記」は任意**。`#comic-gen-prompt-draft` が**空**のときは、`js/app.js` の **`getPromptTextForComicImageApi()`** が **4コマ統合画像プロンプト**（`#comic-unified-prompt-output`）をそのまま **「4コマ画像を生成」** に渡す。**転記なしでAPIから画像まで進められる**（文言は `index.html` / `README.md` と整合）。

## 4コマ統合画像プロンプト（実装メモ）

- **「構成を生成」** で `renderOutputs` が `#comic-unified-prompt-output` を更新する
- 統合プロンプト本文は `js/engine.js` の **`buildUnifiedComicImagePrompt`**。**タイトルテーマ**は本文冒頭の **`【入力反映】` + タイトル（`leadTitle`）** 行で必ず変化する（テーマだけ変えた場合の「前回と同じ文字列」問題の対策）
- **章/本確認用**の各ボタンは Kindle 出力のみ。統合プロンプトは **「構成を生成」** 経路で更新される想定のまま

## Kindle節素材プレビュー（実装メモ）

- **`buildKindleSectionPreview`**（`js/kindle-engine.js`）: **原稿下書き寄り**。note に **【実話】** がある場合は **■見出し付き**で本文を展開し、**outputStyle が Kindle向け**のときの意図が読み取りやすい。**※ 章組み用の短い見出しリスト**は従来の `bodyOutline` を末尾に残す（章プレビュー等の互換）

## Kindle章素材プレビュー（複数入力・実装メモ）

- **`buildKindleChapterMaterial`**（`js/kindle-engine.js`）: 複数節のとき **章テーマ**は各節タイトルのベース（`（` より前）を **・** で束ねる。戻り値に **`chapterIntroDraft` / `sectionBridges` / `chapterClosing` / `outputStyleAnyKindle`** を追加。節素材に **`outputStyle`** を1フィールド追加（既存互換のため任意）
- **`buildKindleChapterPreview`**: 表示を **章ドラフト寄り**にし、**■ 章の導入 → 状況フックの抜粋 → 節の並びと接続（◇ ブリッジ）→ 章末** のあと、**章構成メモ（互換）**で従来の一覧を残す

## Kindle本素材プレビュー（複数章・実装メモ）

- **`buildKindleBookMaterial` / `buildKindleBookPreview`**（`js/kindle-engine.js`）: 複数章のとき **本テーマ**は各章の `chapterTheme` を束ね、**本タイトル**に **（全N章・目次構成案）** を付与。**`bookConcept` / `bookTitleSubtitle`（キーワード推定）・`tocFormatted`・`chapterOrderNote`・`bookClosingPitch`** を追加。プレビューは **本の目次・企画たたき台**を先頭に、従来の **章・学びの詳細（互換）**を末尾に

## note記事本文（実装メモ）

- 生成は `js/engine.js` の **`buildNote`**。見出しは **導入 / 現場で起きたこと / なぜそうなったか / 気づき / まとめ**（`## 学び` は廃止）
- トーン別の導入一文は `js/templates.js` の **`noteLead`**（分析・共有のメタ文ではなく読者向けに寄せた）
- テーマ・現場に **口コミ** または **レビュー** が含まれる場合、導入・「なぜ」は **満足と口コミの別・タイミング**を説明する文に寄せる（題材の芯を保持）
- Kindle の `extractNoteBodyOutline`（`js/kindle-engine.js`）は上記見出し名に追従

## 芯固定欄（実装メモ）

- **フォーム**（`index.html`）: `coreMain` / `corePhrase` / `coreConclusion`。**すべて空なら従来どおり**（`normalizeInput` で空文字扱い）
- **`normalizeInput`** に `coreMain` / `corePhrase` / `coreConclusion` / `hasCoreLocks`。パターン判定の材料に芯文を足す（ズレ抑制）
- **note**: 導入の先頭に **一番伝えたいこと**、現場に **必須表現**を追記、まとめの先頭に **ズラしたくない結論**
- **4コマ**: **状況→違和感→気づき→前進**のラベルで短文情景。口コミ/レビュー系は **仲が良い／でも口コミは来ない／満足と行動は別／導線**の流れに寄せる。芯は **coreMain** を口コミ系では主に3コマ目の軸に、それ以外は1コマ目にも置ける。2コマ目は **必須表現**を相棒セリフに、4コマ目の学び行は **結論**優先（なければ従来の学び）。相棒の長い質問は **`copilotShort`** 等で短文化
- **統合画像プロンプト**: **【芯固定】** ブロック（コア／必須フレーズ／結論・流れの骨格）。画像API・保存導線は未変更

## note本文（短文余白型）

- **`buildNote`**（`js/engine.js`）: 本文に **`##` 見出しは出さない**。先頭は **問いかけ（口コミ/レビュー系）** または **トーンの短文**。実話・学びは **フォーム入力文を優先**（正規化の長文化は 4コマ等に任せる）
- **タイトル**: `theme` に `AI武装親方｜` が含まれる場合は **`stripDuplicateTitlePrefix`** で二重接頭辞を防ぐ
- **Kindle**: `extractNoteBodyOutline` は **段落ベース**で要約（旧 `##` 見出し前提は廃止）

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
