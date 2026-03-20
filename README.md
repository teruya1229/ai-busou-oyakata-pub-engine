# AI武装親方 出版エンジン MVP

## プロジェクト概要
現場で起きた出来事を入力すると、以下を一括で生成する静的Webツールです。
- 4コマ漫画構成
- 4コマ描画プロンプト（1〜4コマ別）
- 4コマ統合画像プロンプト（画像生成API向け。2x2の4コマ漫画・読み順・枠・キャラ一貫性を強めた指示）
- note記事本文
- X投稿文（短文/やや長文/ハッシュタグ案）

## MVPの目的
- まず動く最小構成を優先する
- build不要の静的構成。`index.html` を直接開いてもよいが、**4コマ画像APIと同一オリジンで使う**なら下記「推奨起動」
- 将来拡張しやすいように `js/app.js` `js/engine.js` `js/templates.js` に責務分離する

## 芯の固定（任意入力）
- **この話で一番伝えたいこと / 絶対に入れたい表現 / 絶対にズラしたくない結論**を入力すると、**note本文・4コマ構成・4コマ統合画像プロンプト**に同じ芯が反映されます。**すべて空なら従来どおり**（未入力と同じ動き）です。
- **現場で起きたこと / 今回の学び**は完成文ではなく**素材メモ**でよいです（短文・箇条書き風でも可）。note本文では芯・テーマに合わせて**自然な文章に再構成**されます。
- **note記事本文**は、見出し（`##`）ではなく **タイトル1行＋短文・空行**で並べるスタイルです（タイトルテーマに `AI武装親方｜` が重複して付かないよう吸収します）。
- **4コマ漫画構成**は **状況→違和感→気づき→前進**の短文情景に寄せ、コパイロットのセリフはトーン別の短文（`templates.js` の `copilotShort` 等）を使います。
- **出力スタイル**（フォームのプルダウン）: **指定なし**は従来どおり。**note向け**は短文余白の note（指定なしと同じ本文）、**4コマ向け**は note を短くし 4コマと統合プロンプトを情景寄りに、**Kindle向け**は note に【実話】等の区切りと説明を足し、4コマはテンプレの長い情景行と長めのセリフに寄せます。
- **用途別コピー**（入力欄の直下）: **note本文 / 4コマ構成 / 4コマ統合プロンプト / Kindle節素材**を個別にコピー。**スタイル向けにまとめてコピー**は、出力スタイルに応じて **note向け＝本文＋4コマ**、**4コマ向け＝構成＋統合**、**Kindle向け＝本文＋節素材**、**未指定＝本文＋4コマ＋統合**を `---` 区切りで連結します。
- **note本文の寄せ方**（`notePreset`）: **出力スタイルとは別軸**。**標準**は従来の短文余白。**強め**は冒頭・反転・締めをやや言い切り寄り、**やわらかめ**は問いや接続を柔らかく、**経営寄り**は導線・設計・仕組みの視点を足しすぎない範囲で足す。4コマ・画像APIの生成式は変えない。

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

### 推奨（4コマ画像APIと同一オリジン・CORS不要）
1. `cd api` → `npm install` → `npm start`
2. ブラウザで **`http://127.0.0.1:8787/`** を開く
3. 入力欄を埋めて「構成を生成」を押し、**最終確認**で送るプロンプトを確認してから「この内容で4コマ画像を生成」（同一オリジンで動作）
4. プレビューに画像が表示されたら **「4コマ画像を保存」** で `4koma-comic.png` として保存可能（`data:` URL / 同一オリジンの `http(s)` URL を想定。外部オリジンの URL は CORS により保存に失敗することがあります）

### 静的ファイルのみ（APIなし）
1. `index.html` をブラウザで開く（`file://`）。画像生成APIは別起動が必要で、オリジンが異なると失敗しやすい

## 4コマ画像生成API（推奨仕様・フロント既定）
- **生成用テキスト**（`#comic-gen-prompt-draft`）が空なら、**4コマ統合画像プロンプト**がそのまま API に渡る（**「生成用入力へ転記」は任意**）。有料生成の前に **最終確認ブロック**で入力・4コマ構成・実際のプロンプトを一覧し、**直近で使ったプロンプト**も画面に残る。
- **ローカル既定**: `http://127.0.0.1:8787/api/comic-image`（`js/app.js` の **`COMIC_IMAGE_API_CONFIG.url`**）。本番では例として **`https://your-domain.com/api/comic-image`** へ差し替え。
- **HTTP**: `POST`。**認証**: 初期はなし（将来は同じ `COMIC_IMAGE_API_CONFIG` と `fetch` の `headers` に最小で足す想定）。
- **リクエスト本文**: `{ "prompt": "4コマ漫画を描いてください。1コマ目: ..." }` のように **プロンプト文字列**を `prompt` に入れる。
- **レスポンス本文（成功）**: `{ "imageSrc": "data:image/png;base64,..." }`。**正式キーは `imageSrc`**。将来 **HTTPS の画像URL** を返す場合も **同じ `imageSrc` キー**で返せる（フロントのプレビューはそのまま利用可）。
- 実装互換として **`dataUrl`** キーにも対応しているが、API新設時は **`imageSrc` を優先**すること。

### 付属APIサーバ（`api/`・PHASE 2）
- **`api/.env.example` を `api/.env` にコピー**し、**`OPENAI_API_KEY`** に有効なキーを設定する（**`api/.env` は Git に含めない**）。
- **`cd api && npm install && npm start`** で **8787** 番が起動し、**`http://127.0.0.1:8787/`** で **リポジトリ直下のフロント**（`index.html` / `css/` / `js/`）も配信する。**`POST /api/comic-image`** と同一オリジンで、**`file://` 起因の CORS 問題を避けられる**。
- **`USE_DUMMY=false`（既定）** で **OpenAI Images API**（既定モデル **`gpt-image-1.5`**、環境変数 **`OPENAI_IMAGE_MODEL`** で変更可）により **本物画像**を生成し、**`{ "imageSrc": "data:image/png;base64,..." }`** で返す。
- **暫定仕様（導線確認優先）**: OpenAI が成功したときだけ **本物画像**。**課金上限（例: `billing_hard_limit_reached`）・quota 不足・認証エラー・上流5xx・キー未設定** などで失敗した場合は **API を 500 にせず**、既存の **ダミーPNG（data URL）** に **自動フォールバック**し、同じく **`imageSrc`** を返す。任意で **`"fallback": true`** が付くことがある（フロントは未使用で無視可）。
- **本番運用**では、厳格にエラーを返したい場合は **`api/server.js`** のフォールバック分岐を止める・環境フラグ化するなどで **従来の 500 応答**に戻せる。
- 疎通のみ試す場合は **`api/server.js`** の **`USE_DUMMY`** を **`true`** にするとダミーPNGのみ返却（キー不要）。
- サーバ側の認証は当面なし（OpenAI キーは **`api/.env`** のみ）。

## 評価用ファイル
- 代表ケース: `samples/test-cases.js`
- 評価基準: `docs/evaluation-guide.md`
- 評価ログ: `docs/evaluation-log.md`
- 今後の品質改善は `samples/test-cases.js` の代表ケースを基準に比較しながら進める
- 品質改善の運用順は `samples/test-cases.js` -> `docs/evaluation-guide.md` -> `docs/evaluation-log.md`

## Kindle節素材プレビュー（`js/kindle-engine.js`）
- **Kindle節素材プレビュー**は **原稿下書き寄り**の段落表示（◎フック／■導入・実話・なぜ・気づき・まとめ）。`出力スタイル: Kindle向け` のとき、note の【実話】構造をそのままつながりやすく載せる。**本素材カテゴリ（仕分け）**を表示し、テーマ・現場・学び・芯からキーワードで **顧客と導線** などへ自動ラベル付け（当たらない場合は **その他／雑感**）。**章組み用の短い見出しリスト**は末尾に互換で残す。

## Kindle章素材プレビュー（複数入力・`js/kindle-engine.js`）
- **章/本確認用**の欄に `---` で区切った複数エピソードを入れ、**章素材を確認**で **章ドラフト寄り**のテキストが出る。複数節のときは **章タイトル**が各話題を「・」で束ねた見出し＋（N本の話題）になり、**節ごとのカテゴリ**と **章の主カテゴリ**を表示。**章の導入・節と節の接続文・章末の短いまとめ**が付く。末尾の **章構成メモ**は従来どおり目次・互換用。**いずれかの節が `出力スタイル: Kindle向け`** なら、プレビュー先頭の説明が Kindle 向けを強調する。

## Kindle本素材プレビュー（複数章・目次・`js/kindle-engine.js`）
- **章/本確認用**で `===` で章を区切り、**本素材を確認**で **本の目次・企画たたき台**が出る。**既定の本タイトル**に加え、**販売用のメイン／サブタイトル候補（実話寄り・設計寄り・職人向け実用・シリーズ寄り）**を箇条書きで並べ、切り口を比較しやすくしている。**本素材カテゴリ（仕分け・全体）**で章ごとの主カテゴリと本全体の傾向を表示し、note を溜めたあとの「どの本に入れるか」の整理に使える。**本のコンセプト・目次（構成案）・読み順の意図・編集向けの締め**も先頭付近に出し、従来の **章一覧・各章要約**は末尾の互換ブロックに残す。

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
- Kindle実装設計: `docs/kindle-implementation-plan-v1.md`
- 次フェーズは `docs/kindle-implementation-plan-v1.md` を基準に実装着手へ進む
- Kindle節素材生成の初期実装: `js/kindle-engine.js`
- `js/kindle-engine.js` は `buildEpisodeModel` と `buildKindleSectionMaterial` を担い、1エピソードから節素材オブジェクトを生成する
- 今後は節素材生成を基点に、章素材生成へ段階拡張する
- Kindle章素材プレビュー導線を追加し、単一入力を1節章として確認できる段階まで対応
- `---` 区切りの簡易入力で、複数エピソードを章素材プレビューとして確認できる最小導線を追加
- `---` 区切りの既存複数エピソード簡易入力を再利用し、Kindle本素材プレビューの最小確認導線を追加
- 本素材確認入力は `---`（章内エピソード区切り）と `===`（章区切り）に対応
- 現段階は textarea 1つで複数章を簡易表現する方式
- 現段階の複数入力は簡易方式のため、次フェーズで入力UIを扱いやすく整える余地がある
- 次フェーズは必要に応じて章ごとの入力UI分離を検討し、本素材確認の運用性を最小改善する
- 既存の `chapter-episodes` 簡易入力を再利用し、Kindle本文骨子プレビューの最小確認導線を追加
- 本文骨子確認も `---`（章内）と `===`（章区切り）をそのまま利用し、追加の入力UIは増やさない
- 次フェーズは本文骨子を基点に、章本文のたたき台生成へ進むかを最小差分で判断する
- Kindle章本文たたき台プレビューの最小確認導線を追加し、既存UIを維持したまま表示できるようにした
- 章本文たたき台確認も既存の `chapter-episodes` 簡易入力（`---` / `===`）を再利用し、入力項目は増やさない
- 次フェーズは `introDraft / chapterDrafts / closingDraft` を束ねた全体原稿たたき台生成へ進むかを最小差分で判断する
- Kindle全体原稿たたき台プレビューの最小確認導線を追加し、既存UIを維持したまま表示できるようにした
- 全体原稿たたき台確認も既存の `chapter-episodes` 簡易入力（`---` / `===`）を再利用し、入力項目は増やさない
- 次フェーズは完成原稿寄りの整形、または出力品質調整へ進むかを最小差分で判断する
- Kindle完成原稿寄りプレビューの最小確認導線を追加し、既存UIを維持したまま表示できるようにした
- 完成原稿寄り確認も既存の `chapter-episodes` 簡易入力（`---` / `===`）を再利用し、入力項目は増やさない
- 次フェーズは見え方調整を優先するか、Kindle導線をMVP区切りとして整理するかを最小差分で判断する

## 今後の拡張候補
- 出力品質の調整（4コマテンプレ改善、note文体最適化、X投稿精度向上）
- 現場タイプ別テンプレの追加
- API差し替え可能なインターフェース整備
- 保存機能や履歴機能の追加（将来）
