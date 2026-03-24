# handoff

## ワークフロー方針（2026-03-23）

- **主導線**: **漫画原稿**（`comicManuscriptPost`）→ **8コマ標準ネーム（1/8〜8/8・`comicTitle` / `comic`）**→ **コマ別プロンプト**（`comicPrompt`）→ **統合画像プロンプト**（`comicUnifiedPrompt`）→ **note補助**（`noteIntroAssist` / `noteClosingAssist`）のみ。**旧4コマ短縮**は **`comicLegacy4`**（比較・互換用）。長文note・章メモ・Kindleは **`auxiliary-details`（その他）**で折りたたみ。**X投稿は主線から撤去**（`buildAllOutputs` に含めない。必要なら note 公開後にリンクで回す）。**`buildXPost`** は **`kindle-engine.js` の節プレビュー**が参照するため **`window.AIBusouEngine` にのみ残置**。
- **Kindle**は**将来の別モード**（蓄積素材の一冊化）。**「構成を生成」では `renderKindle*` を呼ばない**（プレビューは手動ボタンまたはその他内の操作で更新）。
- **ネーム**は原稿の切り出し／再配置**。**読者への問い**は原稿の【読者への問い】に残し、**最終コマのナレーションには混ぜない**。**コパイロット**はネーム本文に常時出さない（必須表現があるときだけ相棒行を許可）。

## 8コマ主線の現状態と確認（2026-03-23 追記）

- **記録上のコード位置（2026-03-24 更新）**: **`main` の先端は `105ad39`**（`ca3b90d` で customer_side の **4/8・5/8・7/8** 確定文案を反映。これに先立つ **2/8・3/8・5/8・7/8** 生成経路の再調整は `concreteSceneBank` / `pickOneConcreteScene` / `frictionFromIncident` / `buildFallbackLearning` / `buildNoteConclusionNextLine` / `polishCustomerSideManuscriptPunch` 等）。それ以前の主線整理は **`f03f95c`** 付近を参照（導入・原稿・統合プロンプトの最小修正を含む）。
- **2026-03-23 の確認タスク**: **コード変更なし**。`buildAllOutputs` の生成結果を題材A/Bで確認（ブラウザの「構成を生成」と同じエンジン出力。実機は Node 実行で代替）。

### 直近修正の反映状況（生成テキスト上）

- **導入の途切れ対策**、**導入／事件の分離**、**本質／以後の行動ルールの重複解消**、**統合プロンプトの旧「4コマ」文言除去**は、**意図どおり反映**されている。

### 題材A/Bで確認できたこと

- 【導入】が**途中で切れない**
- 【導入】と【事件】の**役割が分かれる**
- **1/8 と 2/8** の重複感は**弱まった**
- 【本質】と【以後の行動ルール】は**別文**
- **7/8** は行動、**8/8** は問いとして**読める**
- 統合画像プロンプトに **旧「4コマ」表現（`4コマ` 文字列）** は**出ない**

### 未確認（今回）

- ブラウザ実機の **フォント折り返し・スクロール位置**

### 残る違和感（共通）

- **2026-03-24 反映**: **3/8〜6/8** の表示ラベルを原稿ブロック（【強い一言】〜【本質】）に合わせて修正（`js/engine.js` の `COMIC_PANEL_LABELS`・`getComicPanelMetaForExtraction`・芯固定の「ネームの流れ」）。
- **2026-03-24 追記**: 【読者への問い】は **`buildReaderQuestionForManuscript`** で **`topicAxis`**（`customer_side` / `price`・`customer_fit` / **`site_ops`** / その他）ごとに **一文だけ**差し替え。上記以外の軸は **従来の汎用一文**のまま。

### 次回検討（別タスク・必要なら）

- **`docs/` や Kindle 系ドキュメント**に残る旧主線表記の整理（必要なら）

### 主線外の旧表記整理（2026-03-24）

- **`js/templates.js`**: `unifiedImagePrompt.panelArchetype` の「1〜4コマ目」表記を **1/8〜4/8（例）** に変更し、**8コマ主線**と矛盾しない参照用サンプルに整理（**未使用データ**のまま）。**`comicBaseTemplate.panel4`**（未使用）の「小さな学びで終わる」を **余韻・問い**に合わせた一文に変更。
- **`js/engine.js`**: `buildNoteClosingNoConclusionTied` 付近の**コメント**のみ「4コマ向け」→「旧短縮ネーム向け」に置換。**挙動は変更なし**。

### 主線外ドキュメント整合（2026-03-24 追記・`docs/` のみ）

- **`docs/chapter-mapping-examples.md`**, **`evaluation-guide.md`**, **`evaluation-log.md`**, **`sample-section-drafts.md`**, **`sample-section-draft-v2.md`**, **`sample-kindle-chapter-outline.md`**, **`sample-kindle-chapter-draft-v1.md`**, **`sample-kindle-chapter-draft-v2.md`**: 「4コマが主役」「X が主線」「毎回 Kindle」と読める表記を **最小修正**し、**原稿・8コマネーム・note／旧 `comicLegacy4`／X 主線外／Kindle は将来の別モード** と整合。**README・`js/`・UI は未変更**。

### customer_side の【事件】表現（2026-03-24）

- **`js/engine.js`**: `concreteSceneBank.customer_side` の見積・専門用語の1例と、`pickOneConcreteScene` の業界×常識オーバーライドを、**不自然なカギカッコ台詞**から **地の文（空気・反応）**へ。`frictionFromIncident` の **customer_side** 分岐も同趣旨で短縮。

### customer_side の【今なら分かる】・【以後の行動ルール】（2026-03-24）

- **`js/engine.js`**: `buildFallbackLearning` の **customer_side** 一文（学びフォールバック）と、`buildNoteConclusionNextLine` の **`customer_side` 専用分岐**（従来は汎用フォールバックに落ちていた）を、**口語に近い短い一文**へ最小調整。

### customer_side 原稿8ブロックの自然化（2026-03-24）

- **`js/engine.js`**: `concreteSceneBank` / `pickOneConcreteScene` の見積・業界×常識シーン、`pickNoteTurnForTopicAxis`（**customer_side**）、`buildFallbackLearning` / `buildNoteConclusionNextLine`（**customer_side**）を **実話の温度**に寄せて調整。**`buildComicManuscriptPost`** に **`polishCustomerSideManuscriptPunch` / `polishCustomerSideManuscriptEssence`** を追加し、典型パターンの【強い一言】【本質】を短く整える（**他軸・8/8 問い・UI は未変更**）。

### customer_side 4/8・5/8・7/8 の自然化（確定文・2026-03-24）

- **`js/engine.js` のみ（最小3箇所）**: **`pickNoteTurnForTopicAxis`（customer_side・標準プリセット）** の【当時の自分の認識】相当の既定一行、**`buildFallbackLearning`（customer_side）** の【今なら分かる】フォールバック、**`buildNoteConclusionNextLine`（customer_side）** の【以後の行動ルール】を、確定した自然化文案へ差し替え。**8/8・他軸・templates・UI は未変更**。

### customer_side【事件】〜【行動ルール】の再自然化（2026-03-24 追記）

- **`js/engine.js`**: 【事件】は **相手の反応が見える地の文**に寄せ、`buildFallbackLearning` の **customer_side** は **後悔と気づきを一句**にまとめ（`firstSentenceJapanese` による **二文目欠落**を避ける）、【以後の行動ルール】は **自分への約束**調に。**`frictionFromIncident`（customer_side）`** を同趣味に。**他軸・UI・README は未変更**。

## UI文言（参考）

- **1行メモ（超簡易）**: フォーム最上段の **1行メモ** にだけ入力しても生成可能。`｜` または `|` で **テーマ｜伝えたいこと｜結論** と分割した場合は **その優先**（2分割＝テーマ＋伝えたいこと、3分割＝結論まで）。**1行のみ**（区切りなし）のときは、`js/app.js` の `expandSingleSegmentMemo` が **`。！？` の文区切り**、または **`けど` / `でも` / `のに` / `だから`** で **theme（題名向け短縮）／coreMain／coreConclusion** に軽く分ける（各入力欄の表示は変えず、`getInputFromForm` の論理値のみ）。**タイトルテーマ／一番伝えたいこと／結論の欄に文字があるときは、フォーム値を優先**し、1行メモは **空欄の項目の補助**（`getInputFromForm` の `mergeField`）。接続詞で **`left` が空**（例: 文頭が「だから」）のときは **`theme` に全文をフォールバック**（`shortenTitleLike(left || full, …)`）。空なら従来の最小入力3欄どおり
- **最小入力**: フォーム先頭は **タイトルテーマ / 一番伝えたいこと / ズラしたくない結論** のみ。**現場メモ・学び・必須表現・登場人物・トーン・出力スタイル・note寄せ方・章/本確認用**は **`#detailed-input`** の `<details>` 内（初期は閉）。**リセット**で詳細は閉じる。**入力例**で詳細を開く
- **出力スタイル**（`index.html`）: **指定なし**は従来どおり。**note向け / 4コマ向け / Kindle向け**は `js/app.js` の `getInputFromForm()` で `outputStyle` を渡し、`js/engine.js` の `normalizeInput` → `buildNote` / `buildComic` / `buildUnifiedComicImagePrompt` の寄せ方が変わる
- **用途別コピー**: 入力フォーム直下の **用途別コピー（生成後）** から **4コマ／統合／Kindle節**を個別コピー。**note 投稿**は出力側の **note投稿用コピー**カード（タイトル案／本文のみ／H1付き全文／**note投稿セット**＝タイトル案＋本文のみを `---` 区切りで連結。`copyNotePostingBundle()`）。**スタイル向けにまとめてコピー**は `copyStyleBundle()`（`outputStyle` に応じた連結）。各 note ブロック横のボタンは役割名（タイトル欄／本文欄／Markdown）に寄せている
- **統合画像（有料API・8コマネーム）**: 統合プロンプト欄の下に **最終確認**（入力要約・芯・出力スタイル・note寄せ方・8コマネーム・`getPromptTextForComicImageApi()` と同じ送信プロンプト）。ボタンは **この内容で画像を生成**。送信直前に **今回使った生成用プロンプト**欄へ同じ文字列を表示。`requestComicImage` / API 本文は未変更
- **note本文の寄せ方**（`notePreset`）: **出力スタイル（`outputStyle`）とは別**。`js/engine.js` の `normalizeInput` に `notePreset`（`strong` / `soft` / `biz`、未指定は標準）。`buildNote` 系の **導入・反転の接続・締め**と、口コミ系の **冒頭一文**、トーン導入の **短文サフィックス**だけを差し替え。4コマ・統合プロンプトは未変更
- **「生成用入力へ転記」は任意**。`#comic-gen-prompt-draft` が**空**のときは、`js/app.js` の **`getPromptTextForComicImageApi()`** が **統合画像プロンプト**（`#comic-unified-prompt-output`）をそのまま **「この内容で画像を生成」** に渡す。**転記なしでAPIから画像まで進められる**（文言は `index.html` / `README.md` と整合）。

## 統合画像プロンプト・8コマネーム（実装メモ）

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

- **主導線の本文**: `js/engine.js` の **`buildComicManuscriptPost`** が **8ブロックの漫画原稿**を生成し、**`buildAllOutputs` の `noteBodyOnly`** はそれそのもの、**`note`** は **`# タイトル` + 原稿**。**UI**: **`#comic-manuscript-post-output`**（原稿）→ **`#note-body-only-output`** / **`#note-output`**（折りたたみ内）
- **連載向け長文**: **`buildNote`**（見出しなしの読者向け連載文体・`buildNoteShortSpaced` 等）。**Kindle節プレビュー**（`js/kindle-engine.js`）は **`buildNote(rawInput)`** を参照。**主導線では `buildAllOutputs` から `buildNote` を毎回呼ばない**（変換回数削減）
- **`buildFallbackLearning`（学びの補完・原稿の【今なら分かる】材料）**: 現場文に「仕様の確認が…」のように **「確認」だけ**が含まれると、旧条件では **「確認漏れは…」** に誤爆しうる。**`確認漏れ` または `漏れ`** に限定（価格・客層の題材で `inferTopicAxis` の **price** 側のフォールバックに届くようにする）
- **タイトル案**は **`buildNoteTitleCandidateBlock(normalized)`** で生成し、**原稿本文には含めない**。`buildAllOutputs` の **`noteTitleSuggestions`**。**UI**は **`#note-title-suggestions-output`**
- **note本文の長さ**（`noteLengthPreset`・フォーム **`#note-length-preset`**）: **`normalizeInput`** で **`short` / `standard` / `extended`** に正規化。**`buildNoteShortSpaced`** だけが **短め**（導入は芯優先・実話は先頭段落のみ・反転・学びは一句・締め短縮・入力不足の補助行は付けない）／**少し厚め**（実話が一段なら一段追加、すでに段落分かれなら気づきに一行追加）を適用。**Kindle／4コマ向け note** は従来どおり
- **投稿前の確認メモ**（`buildNotePrePublishCheck`・**`#note-prepublish-check-output`**）: **`buildAllOutputs`** の **`notePrePublishCheck`**。**本文のみ**と**タイトル案ブロック**・入力由来のテーマ／芯から、**良い点／気になる点／投稿前に1つだけ**の軽い目安（採点ではない）。コピー導線なし
- **冒頭ブロック `buildNoteOpeningBlock`**: `noteOpeningQuestionLine`（**テーマ・現場・芯・結論**を束ねた文字列に **口コミ**／**レビュー**／**評価** のいずれかがあるとき、プリセット別の**問い**を返す。分岐: **満足＋口コミ**／**仲良く・お客**／**レビュー・評価**／**その他**。**`coreMain` あり**のときは、問いがあれば **問い＋改行＋`coreMain`**、なければ **`coreMain` のみ**。**`coreMain` なし**のときは問い、またはトーンの **`noteLeadWithPreset`**。**`coreMain` と冒頭が先頭付近で重なる**ときは別パターンまたは汎用一行へ寄せる（`noteOpeningQuestionLine` 内）
- **まとめ（締め）`buildNoteFinalBlock`**: **`coreConclusion` あり**のときは **結論＋従来の締め**（`reviewish` は **テーマ＋現場**のみ。**結論あり時の挙動は従来と同じ**）。**結論が空**のときだけ、**テーマ・現場・芯・学び**を束ねた `bundle` で **口コミ系**は **仲良く・お客／導線・満足／既定**、**非口コミ**は **契約・売上系／価格・客層／既定**に分岐し、**プリセット別**に締め段落を変える（短文余白は維持）
- **中盤（反転）`buildNoteTurnAndWhy`**: 実話のあと、**`buildNoteWhy` の先頭文＋でも／ただ**だけに依存しない。**正規化入力の `topicAxis`**（`inferTopicAxis`：価格・客層・人間関係・弟子／教育・現場段取り・営業・感情・伝達系 `alignment_comm` など）を **`pickNoteTurnForTopicAxis` で最優先**。空なら **`noteContextBundle`** で **口コミ／価格・客層／契約・相性／現場改善／既定**に分岐し、**プリセット別**に反転の一行を返す（既定のみ `buildNoteTurnAndWhyLegacy`）。**学びの素材文と先頭がかぶる**ときは短いフォールバック→まだ重なるときはレガシー。**「認識のズレ／共通認識」系の一般論**はデフォルトにせず、伝達系キーワードがあるときだけ **`alignment_comm` 側**に寄せる
- **短文余白型の本文（`buildNoteShortSpaced`）**: **出来事 → 引っかかり → 学び → 次の一手** の4段。**`buildNoteIncidentBlockForArticle`** で冒頭と実話の二重言い換えを避ける。**結論なしの締め**は **`buildNoteClosingNoConclusionTied`**（題材軸・口コミ分岐）。**`inferTopicAxis`** は **人間関係** を **弟子／教育** より先に判定（人間関係の芯が入った複合題材で寄せやすくする）
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

## 次にやるべき1手（2026-03-21・区切り・実機確認フェーズ）

**この区切りでは新規実装を最優先にしない。** まず **ブラウザで題材別の実機確認** を行う（`http://127.0.0.1:8787/` 等で「構成を生成」→ note本文・4コマを目視）。

### 確認題材（最低3本）

1. **人間関係系**
   - **タイトル**: 弟子による私のお客様への直営業
   - **伝えたいこと**: 人間関係をしっかりしないとうまくいかない
   - **結論**: 成功したくても人としての部分を大事にする

2. **価格／客層系**
   - **タイトル**: 最安値の悲劇
   - **伝えたいこと**: 最安値は顧客の層が悪い
   - **結論**: 自分に合う客層を選ぶ方が大事

3. **現場／段取り系**
   - **タイトル**: 協力会社のミスは自分の責任
   - **伝えたいこと**: マニュアルがないと同じミスが起きる
   - **結論**: 再発防止は仕組みに落とすところまでが責任

### 判断基準

- note本文の **1段目と2段目**が **同義反復**になっていないか
- **題材にない一般論**へ逃げていないか
- **最後**が **今回の結論**に着地しているか
- 4コマ **2コマ目**が、また **汎用の「ズレ」系**に戻っていないか
- 4コマ全体を見て **「今回はこの話」**と分かるか

### 注意点

- **怪しいのは `inferTopicAxis` の優先順**（特に **人間関係／弟子・教育／営業** が重なるケース）
- **「短め」プリセット**（`noteLengthPreset`）では **4段の輪郭が薄くなる**可能性がある
- 次回は **大改修ではなく**、**実例で再現したズレだけ**を狭く直すこと
- **Kindle** 側には広げない（現時点では **note編**が主）

## 実機確認メモ（2026-03-21・代表3題材）

- **抽象テーマ・現場メモなし**（`js/engine.js` の **`pickOneConcreteScene`**）：**題材軸ごとに1シーン**を内部生成してから **4コマ**と **note** を組む。**2コマ目**は相手側の**引っかかり**（`frictionFromIncident`）、**3コマ目の親方**は「何がまずかったか」（`oykataInsightFirstLine`）。**結論の次行**は `buildNoteConclusionNextLine`（メタな「行動に落とす」系を避ける）。

- **2026-03-21 追記（題材「業界の常識は顧客の非常識」・芯・結論あり・現場・学び空）**: Node 経由で `buildAllOutputs` 相当を確認。**問題なしをベース**に、**(1)** 長学び時の3コマ目コパイロットが **alignment_comm 寄りの短セリフ**に落ちるのを、`human_relation` 限定で **お客様不安** の一言に変更（`copilotSecondLineForTopic`）。**(2)** 反転と学びが **「人としての線引き」** で重なるときだけ学びを差し替え（`dedupeLearningVersusTurn`）。ブラウザ実機は **同一コード**のため未実施（必要なら `http://127.0.0.1:8787/` で再確認可）

- **2026-03-21 追記（4コマ・顧客反応・コパイロット無音）**: **`customer_side`** 題材では **2コマ目ラベル「お客様の反応」**、**コパイロットは「必須表現」なし時は 2・3コマ目で発話しない**（`comicCopilotSilent`）。**`inferTopicAxis`** は **顧客目線・不親切・業界の常識×顧客の非常識・専門用語×見積**などで **`customer_side`** を **`price` より先**に取る。`README.md` に概要を追記。

- **2026-03-21 追記（統合画像プロンプト・登場人物）**: **`buildUnifiedComicImagePrompt`** は **`customer_side`** で **親方＋お客様**中心。**コパイロット無音時は画像指示でも登場させない**（`buildUnifiedComicCastLines`）。**4コマ描画プロンプト**（`buildPanelPrompt`）の **キャラ行**は `comicPromptCharacters` で **お客様**を明示。

- **実施方法**: ブラウザと同一の `js/engine.js` を Node で読み込み、`normalizeInput` / `buildAllOutputs` で **題材A〜C** を通過確認（最短の再現。同一オリジン起動時も同じ出力）
- **題材A（人間関係）**: 修正前後とも **`topicAxis=human_relation`**。4コマ2コマ目は **人間関係の引っかかり**で、汎用「ズレ」ラベルではない
- **題材B（価格・客層）**: **修正前**は現場文の **「問い合わせ」** で **sales** に先走り。**修正後**は **`topicAxis=price`**（価格・客層を営業より先に判定）
- **題材C（協力会社・再発）**: **修正前**は **協力会社** で **apprentice_education** に先走り。**修正後**は **`topicAxis=site_ops`**。反転は **マニュアル／再発**向けに **`pickNoteTurnForTopicAxis` 内で分岐**（順番のズレ一辺倒を避ける）

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
- Kindle 節・章・本プレビュー本体の大規模変更（※ X投稿は主線から撤去済み。`buildXPost` は Kindle 節プレビュー内部向けに残置）

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
