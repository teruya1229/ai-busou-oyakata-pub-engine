# handoff

## UI文言（参考）

- **1行メモ（超簡易）**: フォーム最上段の **1行メモ** にだけ入力しても生成可能。`｜` または `|` で **テーマ｜伝えたいこと｜結論** と分割した場合は **その優先**（2分割＝テーマ＋伝えたいこと、3分割＝結論まで）。**1行のみ**（区切りなし）のときは、`js/app.js` の `expandSingleSegmentMemo` が **`。！？` の文区切り**、または **`けど` / `でも` / `のに` / `だから`** で **theme（題名向け短縮）／coreMain／coreConclusion** に軽く分ける（各入力欄の表示は変えず、`getInputFromForm` の論理値のみ）。**タイトルテーマ／一番伝えたいこと／結論の欄に文字があるときは、フォーム値を優先**し、1行メモは **空欄の項目の補助**（`getInputFromForm` の `mergeField`）。接続詞で **`left` が空**（例: 文頭が「だから」）のときは **`theme` に全文をフォールバック**（`shortenTitleLike(left || full, …)`）。空なら従来の最小入力3欄どおり
- **最小入力**: フォーム先頭は **タイトルテーマ / 一番伝えたいこと / ズラしたくない結論** のみ。**現場メモ・学び・必須表現・登場人物・トーン・出力スタイル・note寄せ方・章/本確認用**は **`#detailed-input`** の `<details>` 内（初期は閉）。**リセット**で詳細は閉じる。**入力例**で詳細を開く
- **出力スタイル**（`index.html`）: **指定なし**は従来どおり。**note向け / 4コマ向け / Kindle向け**は `js/app.js` の `getInputFromForm()` で `outputStyle` を渡し、`js/engine.js` の `normalizeInput` → `buildNote` / `buildComic` / `buildUnifiedComicImagePrompt` の寄せ方が変わる
- **用途別コピー**: 入力フォーム直下の **用途別コピー（生成後）** から **4コマ／統合／Kindle節**を個別コピー。**note 投稿**は出力側の **note投稿用コピー**カード（タイトル案／本文のみ／H1付き全文／**note投稿セット**＝タイトル案＋本文のみを `---` 区切りで連結。`copyNotePostingBundle()`）。**スタイル向けにまとめてコピー**は `copyStyleBundle()`（`outputStyle` に応じた連結）。各 note ブロック横のボタンは役割名（タイトル欄／本文欄／Markdown）に寄せている
- **4コマ画像（有料API）**: 統合プロンプト欄の下に **最終確認**（入力要約・芯・出力スタイル・note寄せ方・4コマ構成・`getPromptTextForComicImageApi()` と同じ送信プロンプト）。ボタンは **この内容で4コマ画像を生成**。送信直前に **今回使った生成用プロンプト**欄へ同じ文字列を表示。`requestComicImage` / API 本文は未変更
- **note本文の寄せ方**（`notePreset`）: **出力スタイル（`outputStyle`）とは別**。`js/engine.js` の `normalizeInput` に `notePreset`（`strong` / `soft` / `biz`、未指定は標準）。`buildNote` 系の **導入・反転の接続・締め**と、口コミ系の **冒頭一文**、トーン導入の **短文サフィックス**だけを差し替え。4コマ・統合プロンプトは未変更
- **「生成用入力へ転記」は任意**。`#comic-gen-prompt-draft` が**空**のときは、`js/app.js` の **`getPromptTextForComicImageApi()`** が **4コマ統合画像プロンプト**（`#comic-unified-prompt-output`）をそのまま **「4コマ画像を生成」** に渡す。**転記なしでAPIから画像まで進められる**（文言は `index.html` / `README.md` と整合）。

## 4コマ統合画像プロンプト（実装メモ）

- **「構成を生成」** で `renderOutputs` が `#comic-unified-prompt-output` を更新する
- 統合プロンプト本文は `js/engine.js` の **`buildUnifiedComicImagePrompt`**。**タイトルテーマ**は本文冒頭の **`【入力反映】` + タイトル（`leadTitle`）** 行で必ず変化する（テーマだけ変えた場合の「前回と同じ文字列」問題の対策）
- **章/本確認用**の各ボタンは Kindle 出力のみ。統合プロンプトは **「構成を生成」** 経路で更新される想定のまま

## Kindle節素材プレビュー（実装メモ）

- **`buildKindleSectionPreview`**（`js/kindle-engine.js`）: **原稿下書き寄り**。note に **【実話】** がある場合は **■見出し付き**で本文を展開し、**outputStyle が Kindle向け**のときの意図が読み取りやすい。**※ 章組み用の短い見出しリスト**は従来の `bodyOutline` を末尾に残す（章プレビュー等の互換）
- **本素材カテゴリ（仕分け）**: **`inferMaterialCategories`** がテーマ・現場・学び・芯から **顧客と導線／価格と客層／相性と契約判断／現場改善と段取り／AI活用と仕組み化／その他** を付与（**判定順**: 顧客 → 価格 → 契約 → **現場** → **AI**。現場ネタ＋AI の複合では主カテゴリが **現場** になりやすく、AI は副タグになりやすい）。キーワード例: **お客さん／お客／満足／安く・安い・単価／AIで・AIを・AIに／見える化（AI近傍）** など。**`buildEpisodeCategoryBlob`** は芯3項目を結合した語を **末尾にもう一度**足し、1行メモ展開時の芯の効きを少し上げる。**`buildKindleSectionMaterial`** に `materialCategoryPrimary` / `materialCategoryLabels` を追加。**章**は `chapterCategoryBlock`、**本**は `bookCategorySummary`（`buildBookCategorySummary`）

## Kindle章素材プレビュー（複数入力・実装メモ）

- **`buildKindleChapterMaterial`**（`js/kindle-engine.js`）: 複数節のとき **章テーマ**は各節タイトルのベース（`（` より前）を **・** で束ねる。戻り値に **`chapterIntroDraft` / `sectionBridges` / `chapterClosing` / `outputStyleAnyKindle`** を追加。節素材に **`outputStyle`** を1フィールド追加（既存互換のため任意）
- **`buildKindleChapterPreview`**: 表示を **章ドラフト寄り**にし、**■ 節ごとのカテゴリ（仕分け）**を先頭付近に表示。**■ 章の導入 → 状況フックの抜粋 → 節の並びと接続（◇ ブリッジ）→ 章末** のあと、**章構成メモ（互換）**で従来の一覧を残す

## Kindle本素材プレビュー（複数章・実装メモ）

- **`buildKindleBookMaterial` / `buildKindleBookPreview`**（`js/kindle-engine.js`）: 複数章のとき **本テーマ**は各章の `chapterTheme` を束ね、**本タイトル**に **（全N章・目次構成案）** を付与。**`bookConcept` / `bookTitleSubtitle`（キーワード推定）・`tocFormatted`・`chapterOrderNote`・`bookClosingPitch`** を追加。プレビューは **本の目次・企画たたき台**を先頭に、従来の **章・学びの詳細（互換）**を末尾に
- **販売用タイトル候補**: **`inferBookSpineParts`** で章テーマからキーワード軸（顧客と導線／価格と客層／契約と相性）を抽出。**`buildSellableTitleVariants`** が **メイン4案（実話／設計／職人向け実用／シリーズ）**と **サブ4案**を生成し、`sellableMainTitleLines` / `sellableSubtitleLines` として `buildKindleBookMaterial` に載せ、プレビューでは **・** 箇条書きで比較表示

## 語尾補正（`ensureActionEnding`・実装メモ）

- **`js/kindle-engine.js`** の **`ensureActionEnding`**（節の `keyPoint` 等）: 末尾に無条件で **`する。`** を付けない。**`必要` / `こと` / `勇気` / `ない`（否定形）**、**`る`（ただし `…する` は除外）**、五段動詞終止形の **`[うくぐすつぬぶむ]`** など、既に述語として完結しやすい形は **句点のみ**にする。従来の **`する` / `しよう` / `できる`** 分岐は維持

## note記事本文（実装メモ）

- 生成は `js/engine.js` の **`buildNote`**。見出しは **導入 / 現場で起きたこと / なぜそうなったか / 気づき / まとめ**（`## 学び` は廃止）
- **タイトル案**は **`buildNoteTitleCandidateBlock(normalized)`** で生成し、**本文（`buildNote` の戻り）には含めない**。`buildAllOutputs` の **`noteTitleSuggestions`** と **`window.AIBusouEngine.buildNoteTitleCandidateBlock`** で同じ文字列を参照できる。**UI**は **`#note-title-suggestions-output`**（**noteタイトル案**カード）に表示し、**用途別コピー**／**スタイル向けにまとめてコピー**の先頭ブロックとして連結する
- **note本文の二種**: **`buildNote` / `buildAllOutputs.note`** は先頭 **H1（`#`＋タイトル）** 付き。**本文のみ**（note 本文欄向け）は **`noteBodyOnly`**（**`stripNoteLeadingHeading(note)`**）。**UI**: **`#note-body-only-output`**（本文のみ）と **`#note-output`**（H1付き）。**まとめてコピー**（note／Kindle／未指定の note 本文部分）は **`note-body-only-output`**
- **note本文の長さ**（`noteLengthPreset`・フォーム **`#note-length-preset`**）: **`normalizeInput`** で **`short` / `standard` / `extended`** に正規化。**`buildNoteShortSpaced`** だけが **短め**（導入は芯優先・実話は先頭段落のみ・反転・学びは一句・締め短縮・入力不足の補助行は付けない）／**少し厚め**（実話が一段なら一段追加、すでに段落分かれなら気づきに一行追加）を適用。**Kindle／4コマ向け note** は従来どおり
- **投稿前の確認メモ**（`buildNotePrePublishCheck`・**`#note-prepublish-check-output`**）: **`buildAllOutputs`** の **`notePrePublishCheck`**。**本文のみ**と**タイトル案ブロック**・入力由来のテーマ／芯から、**良い点／気になる点／投稿前に1つだけ**の軽い目安（採点ではない）。コピー導線なし
- **冒頭ブロック `buildNoteOpeningBlock`**: `noteOpeningQuestionLine`（**テーマ・現場・芯・結論**を束ねた文字列に **口コミ**／**レビュー**／**評価** のいずれかがあるとき、プリセット別の**問い**を返す。分岐: **満足＋口コミ**／**仲良く・お客**／**レビュー・評価**／**その他**。**`coreMain` あり**のときは、問いがあれば **問い＋改行＋`coreMain`**、なければ **`coreMain` のみ**。**`coreMain` なし**のときは問い、またはトーンの **`noteLeadWithPreset`**。**`coreMain` と冒頭が先頭付近で重なる**ときは別パターンまたは汎用一行へ寄せる（`noteOpeningQuestionLine` 内）
- **まとめ（締め）`buildNoteFinalBlock`**: **`coreConclusion` あり**のときは **結論＋従来の締め**（`reviewish` は **テーマ＋現場**のみ。**結論あり時の挙動は従来と同じ**）。**結論が空**のときだけ、**テーマ・現場・芯・学び**を束ねた `bundle` で **口コミ系**は **仲良く・お客／導線・満足／既定**、**非口コミ**は **契約・売上系／価格・客層／既定**に分岐し、**プリセット別**に締め段落を変える（短文余白は維持）
- **中盤（反転）`buildNoteTurnAndWhy`**: 実話のあと、**`buildNoteWhy` の先頭文＋でも／ただ**だけに依存しない。**`noteContextBundle`** で **口コミ／価格・客層／契約・相性／現場改善／既定**に分岐し、**プリセット別**に反転の一行を返す（既定のみ `buildNoteTurnAndWhyLegacy`）。**学びの素材文と先頭がかぶる**ときは短いフォールバック→まだ重なるときはレガシー
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

- **`buildNote`**（`js/engine.js`）: 本文に **`##` 見出しは出さない**。先頭は **問いかけ（口コミ/レビュー系）** または **トーンの短文**。**実話・気づき**は「現場で起きたこと」「今回の学び」を**素材メモ**として扱い、**そのまま貼らず** `recomposeIncidentMemo` / `recomposeLearningMemo` で**自然文に再構成**（入力が空のときは従来どおり `normalizeInput` の補完文を利用）
- **タイトル**: `theme` に `AI武装親方｜` が含まれる場合は **`stripDuplicateTitlePrefix`** で二重接頭辞を防ぐ
- **Kindle**: `extractNoteBodyOutline` は **段落ベース**で要約（旧 `##` 見出し前提は廃止）

## 次にやるべき1手（運用確認）

- **最優先（2026-03 実投稿フェーズ）**：**実投稿を数本**（目安 **3〜5本**）回し、**投稿前の確認メモ**（`buildNotePrePublishCheck`・**#note-prepublish-check-output**）の**当たり外れ**を観察して手元メモに残す。コード変更が不要なら **記録のみ**でよい
- **次点（2026-03 方針）**：**note を数本**回す。**入力**（1行メモまたは最小3項目＋必要なら詳細）→ **「構成を生成」** → **note投稿用コピー**で **タイトル案／本文のみ／投稿セット** を使い note に貼るまで通し、**違和感**（重複・長さ・トーン・タイトル案のしっくりさ）を手元メモに残す
- **次点（漫画付き投稿）**：**同一オリジン**（`cd api && npm start` → `http://127.0.0.1:8787/`）で **「4コマ画像を生成」**（または手入力 URL / data URL）→ **プレビュー** → **「4コマ画像を保存」** まで通し確認する（**有料APIは費用配慮で最低限**。実施時は **今回使った生成用プロンプト**を記録に残す）
- **品質調整が必要な場合**：**同一オリジンで本物画像の見え方**を確認し、**4コマ感が弱い**ときは **`js/engine.js` の `buildUnifiedComicImagePrompt`** を **最小差分で文言調整**（API は触らない方針のまま）
- **補助的な調整**：必要なら **`api/server.js` の `generateImage` 内**で前置きを足す、`quality` / `size` / `output_format` や **`OPENAI_IMAGE_MODEL`** のトレードオフを記録

※ **画像保存**はフロントの **プレビュー `img` の `src`** を利用。`data:` URL はそのまま保存。**外部オリジンの `http(s)` URL** は **CORS により `fetch` が失敗**することがある（同一オリジン API 返却・data URL は想定内）。

## 判断基準（実投稿・確認メモ・2026-03-21）

- **確認メモで指摘された点**が、**実際の違和感**と合っていたか
- **指摘されなかった**のに、**違和感が残った点**は何か（次の改善の種）
- **タイトル案**と**本文**の**温度感**が揃って読めたか（無理に一字一句揃える必要はない）

## 注意点（確認メモ・実投稿・2026-03-21）

- **判定条件**を増やしすぎない（確認メモはルールベースの**目安**）
- **タイトル整合**を細かく詰めすぎない（実装は冒頭付近の語の重なり中心。過剰に厳密化しない）
- **Kindle** 側へ話を広げない（このフェーズは **note編**が主）
- **短文余白型**の note 本文設計を崩さない

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
- Kindle 節・章・本プレビュー本体の大規模変更、X投稿の全面変更（※ note本文の素材再構成は `engine.js` の `buildNote` 系のみの最小差分で実施済み）

## 実装方針

- ルールベースMVPを維持し、Kindleは `js/kindle-engine.js`
- 画像まわりは **`api/server.js` の `generateImage`** を中心に拡張

## 次の拡張候補

- 429/5xx のユーザー向け一言（サーバ）
- 生成結果のログ（開発時のみ）

## 次にやるべき1手（プロダクト・入力 UX・2026-03-21 追記）

- **実装済み**: **1行メモ超簡易**（`index.html` の先頭1行欄、`js/app.js` の `expandOneLineMemoParts`。`｜`/`|` で3分割、1行のみは theme と coreMain に同値）。フォームのテーマ／芯欄は非破壊（生成時のみ論理反映）
- **実装済み（2026-03-21）**: **雑入力向けカテゴリ推定**（`js/kindle-engine.js` の `inferMaterialCategories` / `buildEpisodeCategoryBlob`。上記判定順・キーワード拡張・芯の二重付与）
- **次点**: **本素材カテゴリ**のさらなる強化（代表ケースで誤分類が出たときにキーワードを足す）
- **中長期**: **本シリーズ設計**や**章順の自動整理**（溜めた note / 章素材を一冊に並べる編集支援。提案型が安全）
- **運用確認の継続**: 同一オリジンで **note → 4コマ画像 → 保存**の通し確認（**画像生成は費用配慮どおり必要最低限**。実施時は **使用した生成用プロンプト**も記録に残す）

## 判断基準（プロダクト方向・2026-03-20 追記）

- **入力負荷 vs 品質**: 超簡易モードは **迷わない1画面**を優先し、品質は **既存の補完・芯・normalizeInput** で支える
- **カテゴリ強化**: 誤分類が増えないよう **代表ケース**で確認してからキーワード・ルールを足す（最小差分）
- **シリーズ・章順の自動化**: **人が上書きできる提案**に留め、一発確定にしない
- **CTA**: 案件方針どおり **CTA 追い込みはしない**（本文・ボタン文言も含め、売り込み導線は別扱い）

## 注意点（プロダクト・2026-03-20 追記）

- **運用の主軸**は「**note を蓄積 → 一冊の Kindle に束ねる**」。単発アイデアの Kindle 化も想定。**ツール販売**はこの再現フローが説明しやすい
- **画像生成 API**は有料のため、開発・検証では **文字出力・プロンプト確認**を主とし、実画像は **適所のみ最低限**
- **ドキュメントのみのコミット**と**実装変更のコミット**を混ぜないと、後から差分が追いやすい
