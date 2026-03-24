# status

## プロジェクト目的
- 現場の出来事から「漫画原稿 → ネーム → note投稿」を主線とする（**X投稿は主線から外し**、必要なら note 公開後にリンクで回す運用）。
- AI APIなしのルールベースで、まず動く最小MVPを作る。

## 世界観
- シリーズ名: AI武装親方
- 主人公: 照屋親方（冷静で観察者、怒らずユーモアあり）
- 相棒: コパイロット（小さなAIロボ、素直で質問役）
- 漫画スタイル: 4コマ固定、白黒、背景白ベース、最後は小さな学び

## MVP方針
- 静的構成（build不要、framework不要）
- 単一画面で入力から出力まで完結
- `js/app.js` `js/engine.js` `js/templates.js` で責務分離
- 最小差分・最小機能で成立させる

## 現在の状態
- 初期MVPを新規作成済み
- ローカルで `index.html` を開けば、入力から3種類の出力生成まで動作する
- 保存機能 / API接続 / Kindle機能は未着手

## 次に作るもの
- 出力品質の調整（トーン別の文体差を拡張）
- 4コマテンプレの改善（現場種類ごとの差分）
- note本文テンプレの精度向上
## 今日やったこと
- 4コマテンプレの型を強化（誤解型 / ヒヤリ型 / 気づき型）
- トーン差を明確化（文体・温度感・コパイロットの出番差）
- 入力不足時の補完を追加（テーマ/現場/学び/登場人物）
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（更新）
- MVPは維持したまま、出力品質の最小改善を実装済み
- UIや構成は広げず、文章品質と安定性を優先
- API / 保存 / Kindle は未着手のまま維持

## 今日やったこと（評価基盤）
- 評価用サンプルケース `samples/test-cases.js` を追加
- 評価ガイド `docs/evaluation-guide.md` を追加
- `README.md` に評価導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（評価基盤更新）
- MVP本体は維持
- 品質改善を比較可能にするための評価基盤を追加する段階
- 次回からは代表ケース基準で微調整を進める

## 今日やったこと（評価ログ）
- 評価ログ `docs/evaluation-log.md` を追加
- 8件分の初回手動評価記録を作成
- `README.md` に評価ログ導線と運用順を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（評価ログ更新）
- MVP本体と評価ケースは揃っている
- 今回は評価結果を蓄積するログを追加する段階
- 次回からはログを見て外れたケースのみ最小修正する

## 今日やったこと（要確認ケース修正）
- `docs/evaluation-log.md` で要確認だった `TC-04` と `TC-08` を対象に最小差分で改善
- `js/engine.js` の入力不足補完と学び焦点の寄せ方を微調整
- `docs/evaluation-log.md` に再評価結果を追記し、判定を更新
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（要確認ケース修正後）
- MVP本体は維持
- 問題ケースだけを個別に改善する段階
- 全体をいじらず、外れたケースから順に精度を上げる運用を継続

## 今日やったこと（全8ケース再点検）
- `samples/test-cases.js` を基準に全8ケースを再点検
- `docs/evaluation-log.md` の全ケース評価とmemoを更新
- 次回優先修正ケースを最大3件（`TC-06`, `TC-07`, `TC-05`）に絞り込み
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（再点検後）
- MVP本体は維持
- 弱点ケースを狙って改善する運用が回り始めている
- 次回は抽出された少数ケースのみ最小修正する段階

## 今日やったこと（優先3ケースのpattern整合）
- `TC-06` `TC-07` `TC-05` の expectedPattern 寄せを最小差分で改善
- `selectComicPattern()` の分岐順とキーワードを必要最小限で調整
- `docs/evaluation-log.md` に再評価結果を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（pattern整合後）
- MVP本体は維持
- 優先弱点ケースだけを狙って修正する運用を継続
- 今回は pattern整合にのみ集中する段階

## 今日やったこと（TC-03/TC-06 X長文改善）
- `TC-03` `TC-06` の X長文のみを最小差分で自然化
- `buildXPost()` 周辺だけを局所修正し、4コマ / note / pattern判定には触れない方針を維持
- `docs/evaluation-log.md` に再評価結果を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（X長文局所改善後）
- MVP本体は維持
- pattern整合は概ね揃っている
- 今回は投稿文としての自然さを局所改善する段階

## 今日やったこと（TC-05/TC-07再確認と最終点検）
- `TC-05` `TC-07` の X長文を再確認し、必要最小限で語尾と温度感を微調整
- 全8ケースの最終一貫性点検を実施
- `docs/evaluation-log.md` に再評価結果と最終所見を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（最終一貫性点検後）
- MVP本体は維持
- pattern整合とX長文の自然さは概ね揃っている
- 次フェーズへ進める前の最終確認段階

## 今日やったこと（Kindle前段設計）
- Kindle前段の章構成設計ドキュメント `docs/kindle-bridge-design.md` を追加
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（Kindle前段設計後）
- MVP本体は固定済み
- 4コマ / note / X の一貫性確認まで完了
- 次は Kindle章へつなぐ設計整理の段階

## 今日やったこと（chapter mapping 試作）
- `docs/chapter-mapping-examples.md` を追加
- 代表ケースを使った「1エピソード -> 1節」「複数エピソード -> 1章」の試作を整理
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（chapter mapping 試作後）
- MVP本体は固定済み
- Kindle前段設計は完了
- 次は章への割り当てが実例ベースで自然かを検証する段階

## 今日やったこと（Kindle章テンプレ固定）
- Kindle章テンプレ固定ドキュメント `docs/kindle-chapter-template.md` を追加
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（Kindle章テンプレ固定後）
- MVP本体は固定済み
- Kindle前段設計と chapter mapping 試作は完了
- 次は章粒度と章テンプレを正式ルールとして固定する段階

## 今日やったこと（1章分実例原稿構成の試作）
- Kindle章テンプレを使った実例ドキュメント `docs/sample-kindle-chapter-outline.md` を追加
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（1章分試作後）
- MVP本体は固定済み
- Kindle章テンプレも固定済み
- 次は実例ベースで原稿構成が自然に流れるかを検証する段階

## 今日やったこと（Kindle原稿化ルール初版）
- `docs/kindle-drafting-rules-v1.md` を追加
- 節ごとの文章粒度（短 / 標準 / 長）を定義
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（原稿化ルール初版後）
- MVP本体は固定済み
- 章テンプレと1章分の実例構成も揃っている
- 次は原稿化ルールを固定して、実際の本文試作へ進む段階

## 今日やったこと（1節分サンプル本文試作）
- `docs/sample-section-drafts.md` を追加
- 1節分の本文を短 / 標準 / 長で試作し、比較結果を整理
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（1節分試作後）
- MVP本体は固定済み
- Kindle原稿化ルール初版も整備済み
- 次は本文粒度の比較を通して標準粒度を決める段階

## 今日やったこと（標準粒度の正式固定）
- `docs/kindle-granularity-policy-v1.md` を追加
- 1章分（4節）の粒度配分方針を整理
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（粒度方針固定後）
- MVP本体は固定済み
- Kindle原稿化ルール初版と1節比較も完了
- 次は1章分の本文試作へ進む前に粒度方針を正式化する段階

## 今日やったこと（1章分本文試作）
- `docs/sample-kindle-chapter-draft-v1.md` を追加
- 1章分（4節）の本文試作を実施
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（1章分本文試作後）
- MVP本体は固定済み
- Kindle原稿化ルールと粒度方針も固定済み
- 次は実際の1章本文を通して文字量感と読み味を確認する段階

## 今日やったこと（章試作レビュー反映）
- `docs/sample-kindle-chapter-draft-v1.md` をレビューし、良かった点と微修正点を整理
- `docs/kindle-drafting-rules-v1.md` に段落数目安・節末要点・文末スタイル統一などを最小差分で反映
- `README.md` に微修正後ルールでの再試作導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（レビュー反映後）
- MVP本体は固定済み
- 1章試作本文まで作成済み
- 次はレビュー反映済みルールで再試作へ進む段階

## 今日やったこと（1節再試作）
- 微修正後ルールを基準に `docs/sample-section-draft-v2.md` を追加
- 既存比較ケース（`TC-06`）で前回差分が分かる1節本文を再試作
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（1節再試作後）
- MVP本体は固定済み
- drafting rules v1 は微修正済み
- 次は再試作した1節を見て、1章再試作へ進めるか判断する段階

## 今日やったこと（1章再試作）
- 微修正後ルールを基準に `docs/sample-kindle-chapter-draft-v2.md` を追加
- 1章分（4節）を再試作し、`sample-kindle-chapter-draft-v1` と比較可能な形で整理
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（1章再試作後）
- MVP本体は固定済み
- 1節の再試作で改善差は確認済み
- 次は4節通した時に読み味と運用性が維持できるか確認する段階

## 今日やったこと（最終固定判断）
- `docs/sample-kindle-chapter-draft-v2.md` をレビューし、章テンプレと drafting rules の最終固定可否を整理
- `docs/kindle-drafting-rules-v1.md` に最終固定判断の追記を反映
- `docs/kindle-chapter-template.md` に1章4節（標準）と例外条件を明記
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（最終固定判断後）
- MVP本体は固定済み
- 1節再試作と1章再試作まで完了
- 次は固定済みルールを前提に量産試作または Kindle生成ルール整理へ進む段階

## 今日やったこと（生成ルール整理）
- `docs/kindle-generation-rules-v1.md` を追加し、将来実装へ接続する生成ルールを整理
- 入力 -> 中間構造 -> 4コマ/note/X -> Kindle章素材 の変換方針を固定
- `README.md` に次フェーズ導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（生成ルール整理後）
- MVP本体は固定済み
- 章テンプレと drafting rules も固定済み
- 次は生成ルールを基準に、量産試作または実装設計へ進む段階

## 今日やったこと（実装設計整理）
- `docs/kindle-implementation-plan-v1.md` を追加
- Kindle生成ルールを実装へ落とす責務分離とデータ構造案を整理
- `README.md` に実装設計フェーズの導線を追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（実装設計整理後）
- MVP本体は固定済み
- Kindle生成ルール整理まで完了
- 次は実装に落とす責務分離とデータ構造整理を行う段階

## 今日やったこと（Kindle節素材の最小実装）
- `js/kindle-engine.js` を追加し、`buildEpisodeModel` と `buildKindleSectionMaterial` を実装
- `buildKindleSectionPreview` を追加し、節素材の確認用テキストを生成可能にした
- `index.html` / `js/app.js` に最小導線を追加し、既存出力を壊さず Kindle節素材プレビューを表示
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（Kindle節素材最小実装後）
- MVP本体は維持
- Kindle実装は節素材生成の最小単位から着手
- 次は section material を chapter material へ束ねる段階

## 今日やったこと（Kindle章素材プレビュー導線追加）
- `index.html` に `Kindle章素材プレビュー` 出力ブロックを最小差分で追加
- `js/app.js` から `buildKindleChapterPreview([input])` を呼び、既存導線を壊さず章素材を追加表示
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（章素材プレビュー導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 単一入力 -> 1節章素材プレビュー もUI確認可能
- 既存MVP本体と既存3出力導線は維持
- 次は複数入力を束ねる章確認導線の検討段階

## 今日やったこと（複数エピソード章確認導線）
- `index.html` に章確認用の複数エピソード入力 textarea（`---` 区切り）を最小追加
- `js/app.js` に分割・入力マッピング処理を追加し、`buildKindleChapterPreview(inputs)` へ接続
- 既存の単一入力生成導線は維持したまま、追加ボタン方式で章確認を実装
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（複数エピソード章確認導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 単一入力 -> 1節章素材プレビュー はUI確認可能
- 複数エピソード -> 1章素材プレビュー の最小確認導線も追加
- 次は入力方式を整えるか、本全体素材へ進むか判断できる段階

## 今日やったこと（Kindle本素材プレビュー導線追加）
- `index.html` に `Kindle本素材プレビュー` 出力ブロックとコピー導線を最小追加
- `js/app.js` で `chapter-episodes` を再利用し、`buildKindleBookPreview([episodes])` を呼ぶ最小導線を追加
- 既存の単一入力導線・章確認導線・3出力導線を維持したまま追加方式で実装
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（本素材プレビュー導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数エピソード -> 1章素材プレビュー はUI確認可能
- 既存の複数エピソード簡易入力から 1冊素材プレビュー もUI確認可能
- 既存MVP本体と既存出力導線は維持されている

## 今日やったこと（複数章入力の最小対応）
- `chapter-episodes` を再利用し、`===` を章区切り、`---` を章内エピソード区切りとして扱う最小パースを追加
- `本素材を確認` 導線を `buildKindleBookPreview([[chapter1], [chapter2], ...])` へ接続し、複数章プレビューに対応
- `章素材を確認` は既存挙動を維持しつつ、先頭章を対象に従来どおり確認できるよう後方互換を維持
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（複数章入力最小対応後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数エピソード -> 1章素材プレビュー はUI確認可能
- 複数章 -> 1冊素材プレビュー も同一textareaの簡易入力で確認可能
- 既存MVP本体と既存の単一入力/章確認/本確認導線は維持されている

## 今日やったこと（本文骨子プレビューUI導線追加）
- `index.html` に「本文骨子を確認」ボタンと `Kindle本文骨子プレビュー` 出力ブロックを最小追加
- `js/app.js` で `chapter-episodes` の既存パースを再利用し、`buildKindleDraftOutlinePreview(chapters)` を呼ぶ最小導線を追加
- reset時に `kindle-draft-output` を初期プレースホルダへ戻す処理を追加
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（本文骨子プレビューUI導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数節 -> 1章素材 はUI確認可能
- 複数章 -> 1冊素材 はUI確認可能
- 1冊素材 -> 本文骨子 もUI確認可能
- 既存MVP本体と既存出力導線は維持されている

## 今日やったこと（章本文たたき台プレビューUI導線追加）
- `index.html` に「章本文たたき台を確認」ボタンと `Kindle章本文たたき台プレビュー` 出力ブロックを最小追加
- `js/app.js` で `chapter-episodes` の既存パースを再利用し、`buildKindleChapterDraftsPreview(chapters)` を呼ぶ最小導線を追加
- reset時に `kindle-chapter-drafts-output` を初期プレースホルダへ戻す処理を追加
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（章本文たたき台プレビューUI導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数節 -> 1章素材 はUI確認可能
- 複数章 -> 1冊素材 はUI確認可能
- 1冊素材 -> 本文骨子 はUI確認可能
- 本文骨子 -> 章本文たたき台 もUI確認可能
- 既存MVP本体と既存出力導線は維持されている

## 今日やったこと（全体原稿たたき台プレビューUI導線追加）
- `index.html` に「全体原稿たたき台を確認」ボタンと `Kindle全体原稿たたき台プレビュー` 出力ブロックを最小追加
- `js/app.js` で `chapter-episodes` の既存パースを再利用し、`buildKindleFullDraftPreview(chapters)` を呼ぶ最小導線を追加
- reset時に `kindle-full-draft-output` を初期プレースホルダへ戻す処理を追加
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（全体原稿たたき台プレビューUI導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数節 -> 1章素材 はUI確認可能
- 複数章 -> 1冊素材 はUI確認可能
- 1冊素材 -> 本文骨子 はUI確認可能
- 本文骨子 -> 章本文たたき台 はUI確認可能
- 章本文たたき台 -> 全体原稿たたき台 もUI確認可能
- 既存MVP本体と既存出力導線は維持されている

## 今日やったこと（完成原稿寄りプレビューUI導線追加）
- `index.html` に「完成原稿寄りを確認」ボタンと `Kindle完成原稿寄りプレビュー` 出力ブロックを最小追加
- `js/app.js` で `chapter-episodes` の既存パースを再利用し、`buildKindleManuscriptPreview(chapters)` を呼ぶ最小導線を追加
- reset時に `kindle-manuscript-output` を初期プレースホルダへ戻す処理を追加
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（完成原稿寄りプレビューUI導線追加後）
- 1エピソード -> 1節素材 はUI確認可能
- 複数節 -> 1章素材 はUI確認可能
- 複数章 -> 1冊素材 はUI確認可能
- 1冊素材 -> 本文骨子 はUI確認可能
- 本文骨子 -> 章本文たたき台 はUI確認可能
- 章本文たたき台 -> 全体原稿たたき台 はUI確認可能
- 全体原稿たたき台 -> 完成原稿寄り整形 もUI確認可能
- 既存MVP本体と既存出力導線は維持されている

## 今日やったこと（Kindle導線MVPの到達点更新）
- Kindle完成原稿寄りプレビューのUI導線追加までを反映し、進捗を最新化
- section -> chapter -> book -> draft outline -> chapter drafts -> full draft -> manuscript の到達を明記
- 上記の各段階がUIから確認可能な状態になったことを明記
- 既存MVP本体（`engine.js` / `templates.js` / 既存3出力導線）が未破壊で維持されていることを明記

## 現在の状態（Kindle導線MVP一区切り）
- Kindle導線MVPは、`section -> chapter -> book -> draft outline -> chapter drafts -> full draft -> manuscript` まで到達済み
- Kindle節素材 / Kindle章素材 / Kindle本素材 / Kindle本文骨子 / Kindle章本文たたき台 / Kindle全体原稿たたき台 / Kindle完成原稿寄り をUI確認可能
- 入力は既存の `chapter-episodes` textarea を再利用し、`---`（章内）/ `===`（章区切り）の簡易仕様を維持
- 既存の 4コマ / note / X 導線を含むMVP本体は未破壊で維持
- 今回は manuscript preview のUI接続完了をもって、Kindle導線MVPとして一旦一区切りの判断が可能な段階

## 今日やったこと（manuscriptText整形の最小調整）
- `js/kindle-engine.js` の manuscript 系のみを最小差分で調整
- `manuscriptText` の改行整形を追加し、3連続以上の改行を2連続へ圧縮
- 章タイトル前後と段落間の空行を安定化し、短い章本文でも見え方が崩れにくいように微調整
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（整形微調整後）
- Kindle導線MVPの段階構造とUI確認導線は維持
- `manuscriptText` は改行過多や段落詰まりを抑えた表示に改善
- 既存MVP本体（`engine.js` / `templates.js` / UI）には変更なし

## 今日やったこと（4コマ描画プロンプト出力の最小追加）
- 既存の `buildComic(...)` 出力を再利用して、1〜4コマ別の描画プロンプト生成処理を `js/engine.js` に追加
- `buildAllOutputs(...)` に `comicPrompt` を最小追加し、既存の 4コマ / note / X 出力は維持
- `index.html` と `js/app.js` に `4コマ描画プロンプト` の表示枠を最小追加
- `README.md` `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（4コマ描画プロンプト追加後）
- 既存の4コマ漫画構成テキストはそのまま確認可能
- 構成テキストに加え、コマ1〜4ごとの描画用プロンプトを同画面で確認可能
- 既存の note / X / Kindle 各導線は未破壊で維持

## 今日やったこと（4コマ統合画像プロンプトの最小追加）
- 既存の4コマ漫画構成と4コマ描画プロンプト生成を再利用し、1枚画像向けの統合プロンプト生成を `js/engine.js` に追加
- `buildAllOutputs(...)` に `comicUnifiedPrompt` を最小追加し、既存キーは維持
- `index.html` と `js/app.js` に `4コマ統合画像プロンプト` 出力ブロックを最小追加
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（4コマ統合画像プロンプト追加後）
- 既存の4コマ漫画構成は維持
- 4コマ描画プロンプト（コマ別）に加えて、1枚画像生成向けの統合プロンプトもUI確認可能
- note / X / Kindle 導線は未破壊で維持

## 今日やったこと（2026-03-20：4コマ漫画画像プレビューUI）
- `index.html` に「4コマ漫画プレビュー」ブロックを最小追加（URL / data URL 入力・反映ボタン・`img` 表示・状態文）
- `js/app.js` に反映処理・読み込み成功/失敗表示・`javascript:` 等の拒否・リセット連携を最小追加
- 画像生成API連携は未着手（手入力の URL / data URL の表示のみ）
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（2026-03-20 作業終了時点）
- 4コマ漫画構成 / 4コマ描画プロンプト / 4コマ統合画像プロンプトのテキスト出力は従来どおり
- 外部で用意した 4コマ1枚画像（`https://...` または `data:image/...`）をプレビュー表示できる
- リセットでプレビュー入力・表示状態も初期化される
- note / X / Kindle 導線は未破壊で維持

## 今日やったこと（2026-03-20 追記：プレビュー入力の扱い改善）
- 長い data URL を想定し、`4コマ漫画画像URL` を `textarea` に変更（補助文・ボタン名「4コマ画像を表示」に整理）
- 入力欄で Ctrl+Enter（Mac は ⌘+Enter）でも反映できるようにした
- 空（空白のみ含む）で反映した場合はプレビュー全体を初期状態へ戻す
- 画像未表示時はプレビュー枠を非表示にし、余白が大きく残りすぎないようにした
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（2026-03-20 追記後）
- プレビュー機能の到達点は維持しつつ、長文貼り付けとショートカット反映を追加
- 画像生成API連携・ファイルアップロードは未着手のまま

## 今日やったこと（2026-03-20：統合プロンプト→プレビュー導線の整理）
- `index.html` で「4コマ統合画像プロンプト」と「4コマ漫画プレビュー」を同一カード内にまとめ、①〜③の流れが追える短い補助文を追加
- 「生成用入力へ転記」で `comic-unified-prompt-output` の内容を `生成用テキスト` textarea に取り込み、外部画像生成の下準備に使えるようにした
- 「生成結果（画像URL / data URL）」欄＋既存のプレビュー反映は維持（API未接続の手運用フローを可視化）
- `js/app.js` に転記処理・リセット時の生成用欄クリアを追加（`js/engine.js` は未変更）
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（統合プロンプト→プレビュー導線整理後）
- 4コマ漫画構成 / 描画プロンプト / 統合画像プロンプトの出力ブロックは維持（統合とプレビューは近接配置）
- 統合プロンプト→生成用欄→（外部生成）→URL・data URL プレビューの流れが1画面で追える
- 本格的な外部画像生成API実装は未着手（将来は③の自動反映を差し込みやすい）

## 今日やったこと（2026-03-20：薄い画像結果アダプター）
- `js/app.js` に `normalizeComicImageResult` と `applyComicImageResult` を追加し、**data URL 1本（推奨）** または `{ imageSrc: string }` を既存「生成結果」欄＋プレビューへ流す土台を用意
- `window.AIBusouComicImageAdapter` を公開（コンソール・将来の fetch 完了コールバックから呼び出し可能）
- `index.html` に「テスト用データURLを反映」（1×1 PNG）と開発者向け1行を最小追加
- `ops/status.md` `ops/handoff.md` を更新（`js/engine.js` は未変更）

## 現在の状態（薄いアダプター追加後）
- 手入力プレビューはそのまま。API返却は **正規化→`comic-image-url` へ代入→既存 `applyComicImagePreview`** の経路で接続可能
- 本格 HTTP クライアント・認証・サービス選定は未着手

## 今日やったこと（2026-03-20：最小 fetch による4コマ画像生成接続）
- `js/app.js` に **`COMIC_IMAGE_API_CONFIG`**（仮URL・1箇所管理）と **`requestComicImage` / `generateComicImageFromPrompt`** を追加
- POST JSON **`{ prompt }`**、応答 JSON の **`imageSrc` または `dataUrl`** を **`applyComicImageResult`** へ流す（data URL 推奨）
- `index.html` に **「4コマ画像を生成」** と API 用の短い状態表示行を追加
- **`getPromptTextForComicImageApi`** は生成用テキスト欄を優先し、空なら統合プロンプト（`pre`）を利用
- API URL 未設定・通信失敗・JSON不正時は **日本語の短文** で `comic-image-api-status` に表示
- **`normalizeComicImageResult`** に **`{ dataUrl }`** を追加。`AIBusouComicImageAdapter` に `requestComicImage` / `generateComicImageFromPrompt` / `COMIC_IMAGE_API_CONFIG` を公開
- `README.md` に仮APIの設定欄と想定ペイロードを最小追記
- `ops/handoff.md` を更新（`js/engine.js` `js/kindle-engine.js` は未変更）

## 現在の状態（最小 fetch 接続後）
- 手入力・転記・テスト用 data URL 反映は維持。実サーバを **`COMIC_IMAGE_API_CONFIG.url`** に載せれば **統合プロンプト系文字列 → API → プレビュー** が1本で試せる
- 認証ヘッダ・複数ベンダ対応・本番運用設計は未着手

## 今日やったこと（確認のみ・実API仕様の整理）
- `js/app.js` の **`COMIC_IMAGE_API_CONFIG` / `requestComicImage` / `normalizeComicImageApiPayload` / `generateComicImageFromPrompt`** を読み、実API確定後に変えるべき箇所を **アプリコードは変更せず** 文書化
- `README.md`・本ファイルの仮API記述を要約し、**URL / method / body / 認証 / レスポンスキー / エラー / data URL優先** の確認項目を `ops/handoff.md` のチェックリストに集約

## 現在の状態（確認整理後・コード無変更）
- 実装ロジックはそのまま。接続前に決めるべき事項と差し替えポイントは **`ops/handoff.md` の「実API接続・仕様確認チェックリスト」** を参照

## 今日やったこと（推奨API仕様への既定値・文書整合）
- `COMIC_IMAGE_API_CONFIG.url` を **`http://127.0.0.1:8787/api/comic-image`** に固定（本番URL例はコメント・README に最小記載）
- `requestComicImage` / `normalizeComicImageApiPayload` は **POST・`{ prompt }`・`{ imageSrc }`** と既に整合のため未変更
- `README.md` に推奨仕様（認証なし・正式キー `imageSrc`・将来HTTPS URLも同キー）を明記
- `ops/handoff.md` を更新（次の1手＝**このURLで応答するAPI本体**、フロントはほぼ準備完了）

## 現在の状態（API既定URL固定後）
- 「4コマ画像を生成」は既定でローカル `8787` を叩く。**APIサーバ未起動時は fetch 失敗メッセージ**
- 手入力プレビュー・4コマ / note / X / Kindle 導線は維持

## 今日やったこと（PHASE 1: comic-image-api 最小サーバ）
- **`api/server.js`** 新規: Express・ポート **8787**・**POST /api/comic-image**・**USE_DUMMY = true** 時は **縦4帯ダミーPNG の data URL** を **`imageSrc`** で返す
- **`api/package.json`** 新規: 依存 **`express` のみ**、`npm start` → `node server.js`
- **`USE_DUMMY = false`** 時は **`generateImage(prompt)`**（空実装）を呼び、戻り空なら **500 + { error }**
- **prompt** 未指定・空は **400 + { "error": "prompt is required" }**
- **CORS**: localhost / 127.0.0.1 / file / `Origin: null` を許可する最小設定
- `README.md` `ops/handoff.md` を更新（フロント・`js/app.js` は未変更）

## 現在の状態（ダミーAPIサーバ追加後）
- `cd api && npm install && npm start` で起動し、フロント「4コマ画像を生成」から **疎通〜プレビュー確認**が可能
- 本物画像生成は **`USE_DUMMY = false` + `generateImage()` 実装** が次段階

## 今日やったこと（PHASE 2: OpenAI 画像生成接続）
- **`api/package.json`** に **`openai`**・**`dotenv`** を追加
- **`api/server.js`**: **`USE_DUMMY = false`**、`dotenv` で **`api/.env`** を読み込み、**`generateImage(prompt)`** で **`openai.images.generate`**（既定 **`gpt-image-1.5`**、**`OPENAI_IMAGE_MODEL`** で上書き可）→ **`data:image/png;base64,...`** を **`imageSrc`** で返却
- **`api/.env.example`** をコミット用テンプレートとし、**`api/.env`** を **`.gitignore`** に追加（秘密をコミットしない）
- **`README.md`**・**`ops/handoff.md`** を更新（フロント・`js/app.js` は未変更）

## 現在の状態（OpenAI 接続後・フォールバック前の記録）
- **`api/.env` に有効な `OPENAI_API_KEY`** があれば、フロント「4コマ画像を生成」から **本物プレビュー**まで可能
- （フォールバック実装前）キー未設定時は **500** と日本語メッセージだった

## 今日やったこと（2026-03-20：OpenAI失敗時のダミーフォールバック）
- **`api/server.js`**: `USE_DUMMY=false` 時、**OpenAI 失敗**（課金上限・quota・認証・上流失敗・キー未設定等）で **500 にせず** **`makeDummyComicPlaceholderDataUrl()`** へフォールバックし、**`{ "imageSrc": "data:image/png;base64,..." }`** を返す。任意 **`fallback: true`**
- **`README.md`**: 本物/フォールバックの暫定仕様と本番での厳格化の余地を最小追記
- **`ops/handoff.md`**: 次の1手を整理

## 現在の状態（2026-03-20 フォールバック後）
- OpenAI 成功時は従来どおり **本物画像**。失敗時は **ダミー画像**で **4コマ画像プレビュー導線**を止めない
- フロント契約 **`imageSrc`** は維持（追加キーは無視可）
- **次の1手**: **課金上限を解消して本物画像で再確認**するか、**プロンプト品質（`generateImage` 内のみ）** を調整するか

### 【2026-03-20 作業終了時点】
- **本日やったこと**: `api/server.js` で OpenAI 失敗・キー未設定時にダミーPNGへフォールバック。README / ops 追記。コミット `adc3a10`、push 済み
- **現在の状態**: working tree clean。`POST /api/comic-image` は成功時は本物、`imageSrc` 契約維持
- **次回やること**: 課金・quota 解消後の本物画像確認、または `generateImage` 内のプロンプト品質調整

## 今日やったこと（2026-03-20：統合画像プロンプトの4コマ漫画寄せ）
- **`js/engine.js`** の **`buildUnifiedComicImagePrompt`**: 2x2・読み順・コマ境界・起承転結・キャラ一貫性・白黒ゆる線・文字なし（表情・構図で伝える）を共通指示で補強。1枚イラスト/ポスター化を避ける文言を追加
- **`README.md`**: 統合画像プロンプトの説明を1行追加
- **`ops/handoff.md`**: 次の1手を本物画像品質確認と文言微調整の流れに更新

## 現在の状態（統合画像プロンプト調整後）
- 4コマ構成 / コマ別描画プロンプト / 統合画像プロンプトの **3層**は維持。出力キー **`comicUnifiedPrompt`** 不変
- **次の1手**: **本物画像生成での品質確認** → 4コマ感が弱ければ **`buildUnifiedComicImagePrompt` の文言をさらに最小調整**

### 【2026-03-20 作業終了時点・追記】
- **本日やったこと（追記）**: 統合画像プロンプトを4コマ漫画寄りに強化（`js/engine.js` のみ）
- **現在の状態**: API・フロント未変更方針を維持
- **次回やること**: 本物画像で見え方確認 → 必要なら統合プロンプトの追加微調整

## 今日やったこと（2026-03-20：api サーバでフロント静的配信・同一オリジン）
- **`api/server.js`**: `GET /` で `index.html`、`/css`・`/js`（存在時は `/assets`）をリポジトリルートから配信。**`POST /api/comic-image`** は維持。`api/` 配下のファイルはマウントしない（`node_modules` 等の露出を避ける）
- **`README.md`**: 推奨起動を `cd api` → `npm start` → `http://127.0.0.1:8787/` に整理
- **`ops/handoff.md`**: 次の1手を「同一オリジンで本物画像品質確認」に合わせて更新

## 現在の状態（同一オリジン配信後）
- **`npm start` 1回**で **`http://127.0.0.1:8787/`** にフロントと **`/api/comic-image`** が揃う（`file://` 不要）
- **次の1手**: **`http://127.0.0.1:8787/`** 上で **本物画像の品質確認** → 弱ければ **`buildUnifiedComicImagePrompt`** または **`generateImage`** の最小調整

### 【2026-03-20 作業終了時点・同一オリジン】
- **本日やったこと**: 上記のとおり静的配信を追加
- **現在の状態**: フロントロジック・`index.html` は未変更（パスは従来どおり `/css` `/js`）
- **次回やること**: 同一オリジンで本物画像の見え方確認

## 今日やったこと（2026-03-20：4コマ画像のダウンロード）
- `index.html` に **「4コマ画像を保存」** ボタンを追加（4コマ漫画プレビュー操作行の隣）
- `js/app.js` に **プレビュー `img` の `src` をそのまま使う**保存処理を追加（`data:` は `<a download>`、`http(s)` は `fetch`→Blob→保存。未表示時は短文アラート）
- `README.md` に保存導線とファイル名・CORS 注意を最小追記
- `ops/status.md` `ops/handoff.md` を更新（`api/server.js` / `js/engine.js` / `js/templates.js` は未変更）

## 現在の状態（4コマ画像ダウンロード追加後）
- 4コマ画像プレビュー表示後、**1クリックで `4koma-comic.png` として保存**可能（data URL・同一オリジン URL を主対象）
- 4コマ / note / X / Kindle の既存導線は維持

### 【2026-03-20 作業終了時点】
- **本日やったこと**: 上記のとおり4コマ画像保存ボタンと `js/app.js` の保存処理、README / ops 更新
- **現在の状態**: プレビュー表示中の画像を保存可能。working tree はコミット・push 後に clean 想定
- **次回やること**: **note 1本 → 漫画生成 → 画像保存** まで通して運用確認

## 今日やったこと（文言整合：転記任意・空欄時は統合プロンプトをそのまま利用）
- `index.html`：4コマ統合画像プロンプト周辺の「流れ」を、`getPromptTextForComicImageApi()` の実装（生成用テキストが空なら統合プロンプトを使用）と一致するよう最小修正
- `index.html`：`#comic-gen-prompt-draft` の label 直下に補助文1行、プレースホルダを「転記は任意」に整合
- `index.html`：4コマ漫画プレビュー説明の「②」参照をやめ、同一カード内の生成／外部の両方に読める表現に変更
- `README.md`：上記を1行で追記（`js/app.js` は未変更）
- `ops/status.md` `ops/handoff.md` を追記

## 現在の状態（文言整合後）
- 画面を読んだ人が **「転記しなくても4コマ画像を生成できる」** と理解しやすい
- 挙動・ボタン・レイアウトの大変更なし（文言のみ）

## 今日やったこと（4コマ統合画像プロンプトが更新されない不具合の修正）
- **原因**: `buildUnifiedComicImagePrompt` の本文はテンプレ＋パネル抽出が中心で、**タイトルテーマだけ変えた場合**に `buildComic` は先頭行で変わるが、統合プロンプト文字列がパネル要約等のみだと**前回と完全一致**しうる（DOM 再描画漏れではなく **生成文字列の差分不足**）
- **対応**: `js/engine.js` の `buildUnifiedComicImagePrompt` 冒頭に **`【入力反映】` + `leadTitle`（4コマ漫画構成と同じタイトル）** を1行追加し、テーマ変更でも統合プロンプトが必ず変わるようにした
- **補助**: `js/app.js` の `renderOutputs` / `clearOutputs` で `#comic-unified-prompt-output` を **`getElementById` で都度参照**して代入
- **章/本確認用**: 複数入力系は従来どおり Kindle 系のみ更新。**「構成を生成」** で統合プロンプトが更新される動きは変更なし
- `ops/handoff.md` を追記（`api/server.js` は未変更）

## 現在の状態（統合プロンプト修正後）
- 「構成を生成」で **4コマ統合画像プロンプト**も入力に追随（少なくとも **タイトルテーマ**が本文先頭に反映）
- 画像生成 API は未実行でも **文字の差分**で確認可能

## 今日やったこと（note記事本文を投稿向け完成原稿へ）
- **問題**: `buildNote` がパターン名・分析調の「なぜ」、キャラ共有のメタ導入、末尾の `登場人物` / `トーン`、`inputSparse` の「補足:」などを混ぜ、**noteにそのまま貼れない**印象になっていた
- **対応**: `js/engine.js` の `buildNote` を **タイトル・導入・現場で起きたこと・なぜそうなったか・気づき・まとめ**の読者向け構成に再構成。本文に **型名・診断ラベル・作業メモ**を出さない
- **導入**: トーン別の `noteLead` を **読者向け一文**に差し替え（`js/templates.js`）。テーマ/現場に **口コミ** または **レビュー** が含まれるときは、**満足と口コミは別・満足直後の導線**の芯を保つ導入に分岐
- **なぜ**: 口コミ系は満足タイミングの説明、その他は従来の3パターン（誤解/ヒヤリ/気づき）に沿う**説明文のみ**（パターン名は出さない）
- **まとめ**: 学び文の繰り返しをやめ、**行動に落とす一文**に変更
- **Kindle**: `extractNoteBodyOutline` の見出しを **なぜそうなったか / 気づき** に合わせて更新（`js/kindle-engine.js`）
- `ops/handoff.md` を追記（`api/`・4コマ画像API・保存導線は未変更）

## 現在の状態（note本文刷新後）
- note出力は **投稿想定の記事本文**中心。メタ行・相談ログ調の補足は本文に混ぜない方針

## 今日やったこと（芯固定欄：note / 4コマ / 統合プロンプトの方向合わせ）
- **追加**: `index.html` の入力フォームに **この話で一番伝えたいこと / 絶対に入れたい表現 / 絶対にズラしたくない結論**（任意）を追加
- **`js/app.js`**: `getInputFromForm()` で `coreMain` / `corePhrase` / `coreConclusion` を `engine` に渡す
- **`js/engine.js`**: `normalizeInput` に芯3項目と `hasCoreLocks` を追加（**すべて空なら従来と同値**）。`buildNote` は導入・現場・まとめに反映。`buildComic` は1コマ目・2コマ目（相棒セリフ）・4コマ目の学び行に反映。`buildUnifiedComicImagePrompt` は **【芯固定】** ブロックを追記（画像API・保存は未変更）
- **`README.md`** に芯固定の意味を追記
- `ops/handoff.md` を更新

## 現在の状態（芯固定欄追加後）
- 芯欄未入力時は **従来どおり**。入力時は **note・4コマ・統合プロンプト**が同じ芯に寄る

## 今日やったこと（note本文を短文余白型へ）
- **課題**: note が `##` 見出し中心の「整理された説明文」になり、実際の note 文体（短文・空行・反転）とズレていた。テーマに `AI武装親方｜` を含めると **接頭辞二重**も起きうる
- **対応**: `js/engine.js` の `buildNote` を **タイトル1行＋本文（`##` なし）** に再構成。冒頭は **問いかけ（口コミ/レビュー系）またはトーンの短文**。実話は **入力の現場文を優先**し、中盤に **「でも」＋なぜ**、**気づきは入力の学びを優先**、締めは **再定義＋問い**（または短い行動）。芯3項目の扱いは維持
- **`normalizeInput`**: `stripDuplicateTitlePrefix` で **タイトル接頭辞の二重付与を防止**
- **`js/kindle-engine.js`**: `extractNoteBodyOutline` を **段落分割**に変更（短文 note でも節素材用の要約が取れるように）
- `README.md` に1行追記、`ops/handoff.md` 更新

## 現在の状態（note短文余白型）
- note本文は **そのまま貼りやすい短文・空行**を優先。4コマ・画像APIは未変更

## 今日やったこと（4コマ構成を短文・情景寄りへ）
- **課題**: 4コマがナレーション説明・型ラベル・長いコパイロット質問で **note本文の温度感とズレ**やすかった
- **対応**: `js/engine.js` の `buildComic` を **状況→違和感→気づき→前進**に整理。**【型】行・長いナレーション**を外し、各パターンは **短文の情景行**（口コミ系は専用の4行）。現場パターンは **誤解/ヒヤリ/気づき**の短文。**口コミ系**では **coreMain** を主に **3コマ目**に置き、1コマ目は実話の **状況**のみにしやすくした
- **`js/templates.js`**: トーンごとに **`oykataShort` / `partnerShort` / `copilotShort`** を追加（未設定時は従来の長文にフォールバック）
- **描画プロンプト・統合プロンプト**: パネル見出しを新ラベルに合わせ、ストーリー説明文を **状況→違和感→気づき→前進**に更新
- `README.md` に1行追記、`ops/handoff.md` 更新

## 現在の状態（4コマ短文情景型）
- 4コマは **説明の羅列より短文情景**を優先。note本文スタイルは変更なし。画像API・保存導線は未変更

## 今日やったこと（出力スタイル切替: note / 4コマ / Kindle）
- **追加**: `index.html` に **出力スタイル**（指定なし・note向け・4コマ向け・Kindle向け）。`js/app.js` の `getInputFromForm()` と章内エピソード分割時の入力に **`outputStyle` / 芯欄**を渡す
- **`js/engine.js`**: `normalizeInput` に **`outputStyle`**（空は従来互換）。**note**: 短文余白は **指定なしと同じ**（`buildNoteShortSpaced`）。**4コマ向け**: `buildNoteComicCompact`、4コマは **短文情景＋短セリフ**（指定なしと同じ寄せ）。**Kindle向け**: `buildNoteKindleStructured`（【実話】等）、4コマは **パターン長文＋長めセリフ**、統合プロンプトに **スタイル一行**を追加
- **`js/kindle-engine.js`**: `buildEpisodeModel` と **`buildKindleSectionMaterial`** の `rawInput` に **`outputStyle` / 芯3項目**を反映（節プレビューがフォームのスタイルに沿う）
- `README.md` に1段落追記、`ops/handoff.md` 更新

## 現在の状態（出力スタイル切替後）
- 用途に応じて **note / 4コマ / 統合プロンプトの寄せ**を変えられる。**未指定は従来どおり**。画像API・保存導線は未変更

## 今日やったこと（用途別コピー導線）
- **追加**: `index.html` に **用途別コピー（生成後）**（note本文・4コマ構成・統合プロンプト・Kindle節素材の個別ボタン＋**スタイル向けにまとめてコピー**）。`js/app.js` に `copyStyleBundle`（`outputStyle` に応じて `---` 区切りで連結）
- **整理**: 各ブロックの `data-copy-target` コピーボタンを **用途が分かるラベル**に変更（X投稿も表記のみ）。`css/style.css` に `.copy-hint` を追加
- `README.md` `ops/handoff.md` 更新

## 現在の状態（用途別コピー後）
- **どれをコピーすればよいか**を、入力直下と各カードの両方から把握しやすくした。生成ロジック（`engine` / `kindle-engine`）は未変更

## 今日やったこと（note本文の微調整プリセット）
- **追加**: `index.html` に **note本文の寄せ方**（標準・強め・やわらかめ・経営寄り）。`js/app.js` の `getInputFromForm()` と章内エピソード用入力に **`notePreset`** を追加
- **`js/engine.js`**: `resolveNotePreset` と `normalizeInput.notePreset`。`noteOpeningQuestionLine` / `noteLeadWithPreset` / `buildNoteTurnAndWhy` / `buildNoteFinalBlock` をプリセットで軽く分岐。Kindle構造の note（`buildNoteKindleStructured`）は **導入の noteLead** に `noteLeadWithPreset` を反映。4コマ・画像APIは未変更
- `README.md` `ops/handoff.md` 更新

## 現在の状態（noteプリセット後）
- note本文だけ **雰囲気を寄せ分け**できる。**短文余白・`##` なし**は維持。4コマ・統合プロンプトの式はそのまま

## 今日やったこと（4コマ画像生成の最終確認UI）
- **`index.html`**: 統合プロンプト／生成用テキストの下に **最終確認**ブロック（入力・芯・スタイル・note寄せ方・4コマ構成・API送信プロンプト）。ボタン **この内容で4コマ画像を生成**。その下に **今回使った生成用プロンプト（直近）**
- **`js/app.js`**: `updateComicImageReviewPanel()`（`renderOutputs` / `clearOutputs` / 転記 / 生成直前 / 生成用テキストの `input` / 確認更新ボタン）。`generateComicImageFromPrompt` 内で送信プロンプトを **last-used** に表示してから `requestComicImage`（処理は従来どおり）
- **`css/style.css`**: `.comic-review-block .review-summary`（定義リストの2列）
- `README.md` `ops/handoff.md` 更新

## 現在の状態（4コマ最終確認UI後）
- 有料API前に **送る内容を一覧**できる。`engine`・`api` の生成式は未変更

## 今日やったこと（Kindle節・原稿下書き寄り）
- **`js/kindle-engine.js`**: `buildKindleSectionMaterial` に **`noteFull`** を保持。`buildKindleSectionPreview` を **段落＋見出し（◎フック／■導入・実話・なぜ・気づき・まとめ）**中心に再構成。**【実話】** 付き note を **sliceBetween** で解体。従来の **番号付きアウトライン**は **※章組み用**として末尾に残す
- **`extractNoteBodyOutline`**: 【実話】構造のときは **ブロック単位**で要約行を生成（導入も抽出可能なら付与）
- `README.md` `ops/handoff.md` 更新

## 現在の状態（Kindle節プレビュー改善後）
- **節素材**のまま **貼って編集しやすい**下書き表示に寄せた。`buildNote`・4コマ・画像APIは未変更

## 今日やったこと（Kindle章・複数節の章らしさ）
- **`js/kindle-engine.js`**: 複数節のとき **章テーマ**を各節タイトルのベースを「・」で束ね、**章タイトル**に **（N本の話題）** を付与。**`chapterIntroDraft` / `sectionBridges` / `chapterClosing` / `outputStyleAnyKindle`** を `buildKindleChapterMaterial` に追加。節素材に **`outputStyle`** を追加
- **`buildKindleChapterPreview`**: **章ドラフト寄り**表示（章の導入・節間◇接続・章末・末尾に互換メモ）。Kindle 向けスタイルがあれば先頭説明を強調
- `README.md` `ops/handoff.md` 更新（`index.html` / `app.js` / `engine.js` / `templates` は未変更）

## 現在の状態（Kindle章プレビュー改善後）
- **複数 note を1章に束ねる**とき、単なる一覧ではなく **導入・接続・締め**が付く。溜めた note を後から一冊化する流れに合わせやすい

## 今日やったこと（Kindle本・目次・企画たたき台）
- **`js/kindle-engine.js`**: `buildKindleBookMaterial` に **本のコンセプト・サブタイトル候補（キーワード推定）・目次（構成案）・読み順メモ・編集向け締め**を追加。複数章のとき **本テーマ**を各章テーマの束ね、`buildKindleBookPreview` を **本の目次・企画たたき台**優先の表示にし、従来ブロックは **互換**として末尾に残す
- `README.md` `ops/handoff.md` 更新

## 現在の状態（Kindle本プレビュー改善後）
- **複数章**を `===` で区切ると、**一冊としてのタイトル候補・コンセプト・目次**が読み取りやすい。企画書・目次下書きにコピペしやすい

## 今日やったこと（ensureActionEnding・語尾崩れの抑制）
- **`js/kindle-engine.js`** の **`ensureActionEnding`** を拡張し、**「必要する」「決めるする」** など **不要な `する。` 重ね**を出しにくくした（**必要・こと・勇気・ない**、**る** 終止、五段の **うくぐすつぬぶむ** 終止などで句点止め）
- `ops/handoff.md` 更新（README は追記なし）

## 現在の状態（語尾補正後）
- Kindle 節・章・本プレビューの **一行要点**が、学び文の語尾に合わせて自然になりやすい

## 今日やったこと（Kindle本・販売用タイトル候補の複数化）
- **`js/kindle-engine.js`**: **`inferBookSpineParts`** を抽出し **`inferBookSubtitleSpine`** と共有。**`buildSellableTitleVariants`** で **メイン／サブ**それぞれ **実話寄り・設計寄り・職人向け実用寄り・シリーズ寄り**の候補を生成し、本プレビューに **箇条書き**で追加
- `README.md` `ops/handoff.md` 更新

## 現在の状態（販売用タイトル候補追加後）
- **本素材を確認**の出力で、**見せ方の違うタイトル案**を並べて比較しやすい

## 今日やったこと（本素材カテゴリ・仕分けラベル）
- **`js/kindle-engine.js`**: **`inferMaterialCategories`** / **`inferBookSpineParts`** とキーワード軸を共有しつつ、節・章・本に **カテゴリ表示**を追加（Kindle節・章・本プレビューのテキストのみ）。`README.md` `ops/handoff.md` 更新

## 現在の状態（カテゴリ仕分け後）
- **どの話がどの本素材軸か**をプレビュー上で把握しやすく、**note 群の整理**に使える

## 今日やったこと（2026-03-20：note本文の現場・学びを素材メモ扱い）
- **`js/engine.js`**: `buildNote` 系で「現場で起きたこと」「今回の学び」を**そのまま貼らず**、短文メモを**本文向けに再構成**（`splitMemoFragments` / `recomposeIncidentMemo` / `recomposeLearningMemo`）。芯・テーマ・口コミ系コンテキストに合わせて接続
- **`index.html`**: 上記2欄のラベルを **（素材メモ）**、プレースホルダを **ラフでOK** に最小変更
- **`README.md`**: 素材メモでよい旨を1行追記
- `ops/status.md` `ops/handoff.md` を更新

## 現在の状態（note素材再構成後）
- note本文は**コピペ感のある羅列**になりにくく、**芯・結論**を軸にした短文余白スタイルは維持。4コマ・画像API・Kindle構造は原則未変更

## 今日やったこと（2026-03-20：最小入力モード）
- **`index.html`**: 冒頭に **テーマ・一番伝えたいこと・結論** のみ表示。現場メモ・学び・必須表現・トーン・出力スタイル・章素材は **`<details>` の詳細入力**に収容（初期は閉じる）
- **`css/style.css`**: `.input-mode-hint` / `.detailed-input` を最小追加
- **`js/app.js`**: リセットで詳細を閉じる。入力例で詳細を開く
- **`js/engine.js`**: 現場メモ空＋芯ありのとき `deriveIncidentFromCore` で補完。学び空は incident 確定後に `ensureLearningText`。`buildFallbackLearning` に口コミ系の一行を追加
- **`README.md`** `ops/handoff.md` を更新

## 現在の状態（最小入力モード後）
- **思いつき時は3項目だけ**で note・4コマ・Kindle節まで生成可能。詳細は従来どおり折りたたみ内で利用可能

## 今日やったこと（2026-03-20：ops ドキュメント整理・実装なし）
- **`ops/status.md`** / **`ops/handoff.md`** のみ更新（**README・実装ファイルは未変更**）。案件の到達点・次の候補・判断基準を追記し、引き継ぎしやすくした

## 現在の状態（ドキュメント整合後・本記録時点）
- コード変更なし。**status / handoff** にプロダクト方針と進捗サマリが揃った

## ここまでの到達点（案件サマリ）
- **プロダクト方針**: **漫画 → note → Kindle** の一貫生成ツールとして進行。**CTA は追わない**。**note を漫画付きで投稿して蓄積**し、**その note 群を一冊の Kindle** にする。または **アイデア単体の Kindle 化**。**最終的にはこの流れをツールとして売る**想定
- **主な実装済み（累積）**
  - note 本文は**短文余白型**へ改善済み
  - 4コマ構成は**情景ベース**へ改善済み
  - **芯固定**（`coreMain` / `corePhrase` / `coreConclusion`）追加済み
  - **出力スタイル切替**（note / comic / kindle）追加済み
  - **コピー導線**整理済み
  - **4コマ画像生成前の最終確認 UI** 追加済み
  - **Kindle 節 / 章 / 本プレビュー**改善済み
  - **販売用タイトル候補**追加済み
  - **本素材カテゴリ（仕分け）表示**追加済み
  - **現場で起きたこと / 今回の学び**は**素材メモ扱い**へ改善済み
  - **最小入力モード**追加済み
  - **1行メモ超簡易**（先頭1行欄・`｜`区切り／単一行の論理展開）追加済み
- **次の候補（未着手・優先度は要調整）**
  - **本素材カテゴリの自動付与**をさらに強化（雑入力向けの軽い調整は実施済み）
  - 必要なら **本シリーズ設計**や**章順の自動整理**

## 今日やったこと（2026-03-22：note中盤・反転〜気づきの分岐）
- **`js/engine.js`**: `buildNoteTurnAndWhy` を拡張。**テーマ・現場・芯・学び**を `noteContextBundle` で束ね、**口コミ系／価格・客層／契約・相性／現場改善／既定**に分岐し、プリセット別の**反転一行**を返す。既定は従来の **`buildNoteWhy` 先頭＋接続詞**（`buildNoteTurnAndWhyLegacy`）。**学び文と先頭がかぶる**ときは短いフォールバック→まだ重なるときはレガシーへ
- **`noteContextBundle`** を追加し、`noteFinalClosingBundle` はそれを参照
- **`README.md`**・**`ops/handoff.md`** を追記

## 今日やったこと（2026-03-22：note締め・結論空の分岐）
- **`js/engine.js`**: `buildNoteFinalBlock` を拡張。**`coreConclusion` あり**のときは従来どおり **結論＋従来の締め**（`reviewish` は **テーマ＋現場**のみで判定）。**結論が空**のときだけ、**テーマ・現場・芯・学び**を束ねた `bundle` で **口コミ系**は **仲良く・お客／導線・満足／既定**、**非口コミ**は **契約・売上／価格・客層／既定**に分岐し、プリセット別に締め文を変える
- **`README.md`**: note の締めに1文追記
- **`ops/handoff.md`**: 実装メモを追記

## 今日やったこと（2026-03-22：口コミ系note冒頭の多様化）
- **`js/engine.js`**: `noteOpeningQuestionLine` を拡張。**テーマ・現場・芯・結論**を束ねた文字列で **満足＋口コミ／仲良く・お客／レビュー・評価／それ以外**に分岐し、プリセット（標準・強め・やわらかめ・経営寄り）ごとに **問いの文を複数パターン**化。**`coreMain` と冒頭が先頭付近でほぼ同文**のときは `default` 行へ寄せ、まだ重なるときは **汎用の一行**にフォールバック
- **`README.md`**: note の冒頭に1文追記
- **`ops/handoff.md`**: 実装メモを更新

## 今日やったこと（2026-03-22：1行メモ接続詞の空ガード・note冒頭の現状確認）
- **`js/app.js`**: 接続詞分割（`けど` / `でも` / `のに` / `だから`）で **`left` が空**のとき **`theme` が空にならない**よう **`shortenTitleLike(left || full, 36)`** に最小修正（例: 「だから確認を先に置く」）
- **`js/engine.js`**: **未変更**（今回は `buildNoteOpeningBlock` の挙動確認のみ。**冒頭多様化は未着手**）
- **`ops/handoff.md`**: `buildNoteOpeningBlock` の整理を追記

## 今日やったこと（2026-03-21：1行メモの1分割補完）
- **`js/app.js`**: `｜` / `|` で **2分割以上**のときは従来どおり。**1分割だけ**のときは **`。！？` で文分割**、または **`けど` / `でも` / `のに` / `だから`** で前後に分け、**theme は題名向けに短縮**、**coreMain は本文の芯**（文2つ以上は先頭文、接続詞は全文）、**coreConclusion は末文または後半**に振り分け
- **`index.html`**: 1行メモの補助文を上記挙動に合わせて最小更新
- **`README.md`**: 1行追記
- **`js/engine.js`**: 未変更（生成本文のスタイルは触らない）

## 今日やったこと（2026-03-21：本素材カテゴリ推定の軽い強化）
- **`js/kindle-engine.js`**: `inferMaterialCategories` に **お客さん／お客／満足／安く・安い・単価／AIで・AIを・AIに・AIの／見える化（AI近傍）** などを追加。**現場改善と段取り**を **AI活用と仕組み化** より先に判定**（現場ネタ＋AI のとき主カテゴリが現場側になりやすい）**。`buildEpisodeCategoryBlob` で **芯3項目を結合した語**を末尾にもう一度足し、1行メモ展開時の芯の効きを少し上げた
- **`README.md`**: Kindle節のカテゴリ説明に1文追記
- **`ops/handoff.md`**: 実装メモを追記

## 今日やったこと（2026-03-21：1行メモ超簡易モード）
- **`index.html`**: 入力フォーム先頭に **1行メモ（超簡易）** を追加（`｜` / `|` 区切りで3分割、1行のみはテーマと芯に共通利用の補助文付き）
- **`js/app.js`**: `expandOneLineMemoParts` と `getInputFromForm` で1行メモを **theme / coreMain / coreConclusion** に展開（**フォームの表示値は上書きしない**。生成・プレビュー時の論理入力のみ反映）
- **`README.md`** に1行追記
- **`js/engine.js` `js/kindle-engine.js` `js/templates.js`**: 未変更（既存 `normalizeInput` をそのまま利用）

## 今日やったこと（2026-03-21：noteタイトル案の複数パターン）
- **`js/engine.js`**: 短文余白 note（`buildNoteShortSpaced`）の **H1直下**に **【タイトル案】** を追加（**言い切り／実話・違和感／気づき・本質**の3方向。`noteContextBundle` 系の題材分岐で口コミ・価格・契約に軽く寄せ、`coreMain`／`coreConclusion` を芯として優先）。**Kindle向け note 本文・4コマ・画像APIは未変更**
- **`README.md`**・**`ops/handoff.md`** を追記

## 現在の状態（noteタイトル案複数化後）
- 既定の note 本文だけ、貼る前に **切り口の違うタイトル案**を並べて選びやすい
- 本文ブロック（導入・反転・締め）の構成ロジックは原則そのまま

## 今日やったこと（2026-03-21：noteタイトル案を本文から分離）
- **`js/engine.js`**: `buildNoteShortSpaced` から **【タイトル案】** を除去（本文は投稿用のまま）。**`buildAllOutputs`** に **`noteTitleSuggestions`** を追加（`buildNoteTitleCandidateBlock` を再利用）。**`buildNoteTitleCandidateBlock`** をエンジン公開APIに追加
- **`index.html`**: **noteタイトル案**の表示枠とコピー導線を最小追加
- **`js/app.js`**: 生成結果の描画・リセット・**スタイル向けにまとめてコピー**（先頭にタイトル案）を接続
- **`README.md`**・**`ops/handoff.md`** を追記

## 現在の状態（タイトル案分離後）
- **note本文**にタイトル案ブロックが混ざらず、そのまま貼りやすい
- **タイトル案**は別枠で確認・個別コピー可能。まとめてコピー時も先頭に付く

## 今日やったこと（2026-03-21：note本文の H1 付き／本文のみの分離）
- **`js/engine.js`**: **`stripNoteLeadingHeading`** で先頭の `# …` 行と直後の空行を除去。**`buildAllOutputs`** に **`noteBodyOnly`** を追加（**`note`** は従来どおり H1 付き全文）
- **`index.html` / `js/app.js`**: **本文のみ**と **H1付き**の表示・コピーを分離。**スタイル向けにまとめてコピー**の note 系は **本文のみ**（`#note-body-only-output`）を連結（4コマ向けは従来どおり本文ブロックなし）
- **`README.md`**・**`ops/handoff.md`** を追記

## 現在の状態（H1／本文のみ分離後）
- **投稿用**は **本文のみ**をコピー。**Markdown 見出し付き**が欲しいときだけ **H1付き**を使える

## 今日やったこと（2026-03-21：note本文の長さプリセット）
- **`index.html`**: **note本文の長さ**（標準／短め／少し厚め）を最小追加
- **`js/app.js`**: **`noteLengthPreset`** を入力に含める（章内エピソード分割時も引き継ぎ）
- **`js/engine.js`**: **`resolveNoteLengthPreset`** と **`buildNoteShortSpaced`** 内の長さ分岐（**短文余白 note のみ**。Kindle／4コマ compact は未変更）
- **`README.md`**・**`ops/handoff.md`** を追記

## 現在の状態（note長さプリセット後）
- **標準**は従来互換。**短め**は最短ルート、**少し厚め**は一段だけ厚み。**タイトル案・H1分離**はそのまま

## 今日やったこと（2026-03-21：note投稿用コピー導線の整理）
- **`index.html`**: **note投稿用コピー**カードを追加（タイトル案／本文のみ／H1付き全文／投稿セット）。**用途別コピー**から note 単体ボタンを外し、補助文で誘導。**noteタイトル案／note記事本文**のラベルと補足を役割ベースに整理
- **`js/app.js`**: **`copyNotePostingBundle`**（タイトル案＋本文のみ）。**`data-copy-skip`** で投稿セットボタンを既存 `.copy-btn` 一括ハンドラから除外
- **`css/style.css`**: **`.note-posting-copy-card`** を最小追加
- **`README.md`**・**`ops/handoff.md`** を追記

## 現在の状態（noteコピー整理後）
- **投稿時**は **note投稿用コピー**を見れば足りる。**用途別**は 4コマ・Kindle まわり中心

## 今日やったこと（2026-03-21：運用優先の引き継ぎ同期）
- **`ops/handoff.md`** の **「次にやるべき1手（運用確認）」** を更新。**最優先**を **note を数本実際に回して違和感を拾う**に合わせ、**4コマ画像の通し確認**は **次点**（費用配慮・プロンプト記録の注意は維持）
- **`ops/status.md`** に本記録を追記（**実装ファイル・README は未変更**）

## 現在の状態（運用優先の引き継ぎ同期後）
- コード挙動は不変。**引き継ぎ文書**の「次の1手」が **note 実運用 → 漫画付き通し**の順で読みやすい

## 今日やったこと（2026-03-21：投稿前の確認メモ）
- **`js/engine.js`**: **`buildNotePrePublishCheck`** を追加（本文のみ・タイトル案・正規化入力を材料に、メモ臭さ／硬さ／主語／タイトルとの整合／note向きの観点で**確認メモ**を生成）。**`buildAllOutputs`** に **`notePrePublishCheck`** を追加
- **`index.html`**: **note記事本文**の下に **投稿前の確認メモ**ブロックを追加
- **`js/app.js`**: 生成・リセットで **`#note-prepublish-check-output`** を更新
- **`css/style.css`**: **`.note-precheck-card`** を最小追加
- **`README.md`** `ops/handoff.md` を追記（Kindle・4コマ最終確認UIは未変更）

## 現在の状態（投稿前の確認メモ追加後）
- 実投稿前に**軽い違和感チェック**を同画面で確認可能。既存の note 本文・タイトル案・コピー導線は維持

## 今日やったこと（2026-03-21：記録整理・実投稿フェーズへ）
- **note向け投稿前の確認メモ**（**`buildNotePrePublishCheck`**・**note本文直下の確認UI**・**README / ops 追記**）が完了した前提で、**ops/status.md**・**ops/handoff.md** を**実投稿テスト**向けに整理（**本セッションは記録のみ。実装コードは未変更**）

## 現在の状態（記録整理後・2026-03-21）
- **note編**は**実運用テストに入れる段階**。投稿前の違和感は、**感覚だけでなく確認メモ**でも眺められる
- **本文・タイトル案・投稿用コピー**は既存どおり。**Kindle／4コマ**は本記録の区切り時点では**深掘り対象外**（最終確認UIも未変更のまま）

## 次にやるべきこと（実投稿フェーズ）
- **note を3〜5本**実際に投稿し、**確認メモと自分の感覚のズレ**だけ手元に記録する
- **再現するズレ**が見えたら、その条件にだけ**最小ルール追加**で調整する（判定の増やしすぎは避ける）

## 今日やったこと（2026-03-21：note／4コマの入力反映と具体性）
- **`js/app.js`**: **`getInputFromForm`** で **タイトルテーマ／芯／結論のフォーム入力を1行メモより優先**（空欄の項目だけ1行メモで補完）
- **`js/engine.js`**: **`buildComic`** を **入力固有のズレ・気づき・次に変える**で組み立て。**`buildNoteOpeningForArticle`** で冒頭を「今回は〜」の**出来事起点**に。**`buildNoteFinalBlock`** は **結論あり時**に汎用長文締めをやめ**一行の次の一手**に。**`deriveIncidentFromCore`**・素材メモの抽象語を緩和。**`classifyNoteMidBranch`** に **最安値**系。**`buildUnifiedComicImagePrompt`** を短く整理（重複削減）
- **`index.html`**・**`README.md`**・**`ops/handoff.md`** を最小追記

## 現在の状態（具体性改善後）
- **4コマ**は骨格維持のまま、**中身が入力に追従**しやすい。**note**は**結論あり時の締め**が今回に結びつきやすい

## 次にやるべきこと（追記）
- 実投稿・複数題材で**まだ薄く見えるパターン**があれば、その条件だけ**追加の最小ルール**で調整

## 今日やったこと（2026-03-21：題材軸とコパイロット分離・大改修）
- **`js/engine.js`**: **`inferTopicAxis`／`topicAxis`** で題材（価格・客層・人間関係・弟子／教育・現場段取り・営業・感情・伝達系のみ `alignment_comm` など）を推定。**4コマ2コマ目・相棒・コパイロット2行目**を軸別に分岐（「ズレ」ラベルは伝達系に限定）。**note**は `pickNoteTurnForTopicAxis` で中盤を軸優先、**`buildNoteWhy`** で軸別の「なぜ」を先に当てる。**X長文・タイトル代替・統合プロンプト**から汎用の「前提の未共有」「ズレ」一辺倒の文言を緩和。**`buildNoteFinalTail*`** の「ズレが見えた」を「論点が言葉になった」に置換
- **`js/templates.js`**: トーン別コパイロット質問の「ズレ」偏重を緩和。**誤解型**の `keywords` から単体「認識」を外し具体語へ
- **`README.md`**・**`ops/status.md`**（本節）・**`ops/handoff.md`** を追記

## 現在の状態（題材軸分離後）
- **note／4コマ**は題材ごとに中盤・学びの言い回しが変わりやすく、**無関係な「認識のズレ」回収**をデフォルトにしない設計

## 次にやるべきこと（題材軸後）
- 「弟子が私のお客に直営業」などで **人間関係／弟子**が軸として拾われ、本文・4コマに無関係な「共通認識」が混ざらないか**ブラウザで1本確認**

## 今日やったこと（2026-03-21：note本文の4段フロー再構築）
- **`js/engine.js`**: **`buildNoteShortSpaced`** を **出来事／引っかかり／学び／次の一手** の4段に整理（**`buildNoteIncidentBlockForArticle`** で冒頭と実話の重複を回避、**`dedupeLearningVersusTurn`** で中盤と学びのかぶりを緩和）。**`buildNoteClosingNoConclusionTied`** で結論なしの締めを題材軸に接続し、**「次の一枚」「それで十分」** 等を除去。**`inferTopicAxis`** で **人間関係** を **弟子／教育** より先に判定。**`pickNoteTurnForTopicAxis`** に **general** 軸を追加。**`extendNoteStoryOrLearning`** を題材寄りに。**`入力が短くても〜` の本文追記**を廃止。**`deriveIncidentFromCore`／`recomposeIncidentMemo`** でタイトル文言の本文直複製を抑止
- **`README.md`**・**`ops/handoff.md`**（本記録）を追記

## 現在の状態（note本文フロー再構築後）
- 短文余白は維持しつつ、**1本の出来事として前に進む**本文になりやすい

## 次にやるべきこと（note本文確認）
- 題材例（弟子の直営業・人間関係の芯・結論あり）で **4段の流れ**と **締めの着地**をブラウザで1本確認

## 2026-03-21 区切り（記録・実機確認フェーズへ）

本節は **記録の整理**（この時点では **コード変更なし**）。直近の大きな改修の要旨を一箇所にまとめ、**次回は実機確認を最優先**にするための区切りとする。

### 本日（記録として整理した）要旨

- **コパイロット由来の固定思想**（認識のズレ／共通認識／言葉を揃える 等）を **常設から条件付きへ後退**させた
- **`inferTopicAxis`** を導入し、価格／客層／人間関係／弟子・教育／営業／感情／現場 などの **題材軸**で出力を分ける方向へ整理した
- **4コマ**を **出来事 → 引っかかり → 気づき → 次の一手** 寄りへ修正した
- **note本文**を **出来事 → 引っかかり → 学び → 次の一手** の4段寄りに再構成した
- **汎用締め**や **ツール都合の文**を本文から弱めた／削った

### 現在の状態

- 以前のように全題材が「ズレ／共通認識」方向へ吸われる状態は **かなり弱まった**
- note本文は **短文余白型を維持**しつつ、**文章の羅列から記事の流れへ**戻す方向に入った
- ただし **完成ではなく**、**実機で題材別に確認して最後の癖を潰す段階**
- **Kindle** は今回未着手のまま

### 次にやること

- **ブラウザで最低3題材**を実機確認する
- **人間関係系／価格・客層系／現場・段取り系**の3本で、note本文と4コマの分岐を確認する
- **一般論へ逃げる箇所**や **題材軸の優先順がズレる箇所**だけを **最小修正**する

## 2026-03-21 実機確認（代表3題材）と最小修正

### 確認した題材（入力は handoff の A/B/C と同一）

- **A（人間関係）**: タイトル「弟子による私のお客様への直営業」、芯・結論・現場・学びあり
- **B（価格・客層）**: タイトル「最安値の悲劇」、問い合わせ文を含む現場メモあり
- **C（現場・再発）**: タイトル「協力会社のミスは自分の責任」、マニュアル・再発を含む

### 再現したズレ（修正前）

- **B**: 現場メモに **「問い合わせ」** があり、`inferTopicAxis` が **sales** を先に取り、**最安・客層**より **営業**に寄っていた（note中盤・4コマ2コマ目が営業寄りになる）
- **C**: **「協力会社」** だけで **apprentice_education** が先に当たり、**ミス・マニュアル・再発**の芯より **役割の境界**の中盤になっていた

### 狭く直した内容

- **`inferTopicAxis`**: **価格・客層**の判定を **営業（直営業／営業／集客／問い合わせ）** より **前**へ。**協力会社**かつ **ミス／手順／マニュアル／再発／段取り／手戻り** を含むときは **site_ops** を優先
- **`pickNoteTurnForTopicAxis`（`site_ops`）**: 文脈に **マニュアル／再発／仕組み＋ミス** 等があるときは、**順番のズレ**より **再発防止・手順**寄りの反転文に分岐

### 確認結果（修正後・`buildAllOutputs` 相当）

- **A**: `topicAxis=human_relation`、4コマ2コマ目は **人間関係の引っかかり**（汎用「ズレ」ラベルではない）
- **B**: `topicAxis=price`、中盤は **価格・客層**、2コマ目ラベル **価格・客層の引っかかり**
- **C**: `topicAxis=site_ops`、中盤は **注意だけでは同じミスが繰り返されやすい** 系、2コマ目は **現場の問題**

### 残り気になる点（次回の候補）

- **C** で反転と学びの両方に **「注意」** が出ると、意味が近い **二段**になることがある（必要なら学び行の重複緩和だけ検討）

## 2026-03-21 抽象テーマの具体シーン化（実装）

### 目的

- 入力欄を増やさず、**現場メモが空で芯・テーマだけ**のときに、**抽象テーマの言い換え**だけで終わらないよう、**内部で1シーン**を立ててから **4コマ**と **note** を生成する。

### 実装内容（`js/engine.js`）

- **`pickOneConcreteScene` / `concreteSceneBank`**：題材軸ごとに **具体シーン**の候補を少数保持。テーマ語（例: **業界の常識は顧客の非常識**、**最安値**、**協力会社** 等）に合わせた **優先オーバーライド**あり。
- **`deriveIncidentFromCore`**：上記シーンを **出来事**として採用（`sceneGrounded`）。
- **4コマ**：2コマ目は **`frictionFromIncident`**（相手側の引っかかり）、3コマ目の親方1行目は **`oykataInsightFirstLine`**（「何がまずかったか」）。**`buildComicGapNarrative`** は芯の抽象説明ではなく摩擦を表示。
- **note**：結論ありの次行は **`buildNoteConclusionNextLine`**（「行動に落とす」等のメタを避ける）。**`recomposeIncidentMemo`** は `sceneGrounded` 時に「この場面で…」のラップを付けない。
- **学び空の補完**：**`buildFallbackLearning`** は **incident＋theme＋coreMain＋coreConclusion** を束ねて `inferTopicAxis`（`見積` だけで price に寄るのを防ぐ）。

### 確認題材（1行）

- **業界の常識は顧客の非常識**（芯・結論あり・現場メモなし）：**見積で専門用語のまま押し切った**シーンが立ち、4コマ2コマ目は **相手の反応**、3コマ目は **親方の気づき行**が分かれる。

## 今日やったこと（2026-03-21：抽象テーマ具体シーン化・1題材再検証と最小修正）

### 確認した題材（入力）

- **1行メモ／タイトル**: 業界の常識は顧客の非常識
- **一番伝えたいこと**: 業者の当たり前で動くと、お客様には不親切になることがある
- **結論**: 現場の都合より、まずお客様目線で考える方が信頼につながる
- **現場・学び**: 空、トーン「少し真面目」

### 確認方法

- **`js/engine.js` と同一ロジック**を Node（`vm` で `window` を与えて `templates.js` → `engine.js` 読込）から `buildAllOutputs` 相当で取得。**ブラウザ実機は未実施**（同一コードのため出力は一致する想定）

### 現状評価（目視）

- **4コマ**: 1コマ目に具体シーンあり。2コマ目は相手側の引っかかり。3コマ目親方の気づきは題材と整合。全体として「今回はこの話」と読める
- **note**: 抽象の羅列には戻っていない。1本の出来事として読める。結論は入力に着地。メタ／ツール臭い文は目立たない

### 気になった点と最小修正（`js/engine.js` のみ）

- **優先1**: 学びが長いときの3コマ目コパイロットが `toneData.copilotShort`（**「確認の順、どこで分かれた？」**）に落ち、**お客様目線の題材とずれる** → **`human_relation` かつ長学び**のときだけ **「先に、お客様の不安は聞けた？」** に差し替え（`copilotSecondLineForTopic`）
- **優先2**: 反転（「人としての線引きが曖昧だと…」）と学びの両方に **「人としての線引き」** が重なる → **`dedupeLearningVersusTurn`** で当該重複時のみ、学びを **順番・お客様不安** 寄りの一文に差し替え

### 現在の状態

- 上記題材では **4コマ／note** の観点は満たし、指摘2点は **狭く解消済み**

## 今日やったこと（2026-03-21：4コマ・顧客反応優先とコパイロット無音）

### 内容

- **`inferTopicAxis`**: **顧客感覚系**を **`customer_side`** として追加（`isCustomerSideBundle`）。**`review` の直後**、`price`（見積）より先に判定
- **`buildComic`**: `customer_side` では **`comicCopilotSilent`** により **2・3コマ目にコパイロット短セリフを入れない**（**必須表現**があるときのみ従来どおり）
- **2コマ目**: `gapLabelForAxis` で **「お客様の反応」**、`frictionFromIncident` で **顧客の反応文を強化**
- **note**: `pickNoteTurnForTopicAxis`・`extendNoteStoryOrLearning`・`buildFallbackLearning` に **最小限**の `customer_side` 分岐
- **`README.md`**: 上記を1段落で追記

### 確認題材

- **業界の常識は顧客の非常識**（芯・結論あり・現場・学び空）: **`topicAxis=customer_side`**、2コマ目に **お客様のセリフ**、コパイロット **2・3コマ目に発話なし**

## 今日やったこと（2026-03-21：統合画像プロンプトの登場人物を customer_side に整合）

### 内容

- **`buildUnifiedComicImagePrompt`**: `customer_side` では **親方＋お客様**を主役とする **`buildUnifiedComicCastLines`** を導入。**コパイロット無音時は描かない**旨を明記。**2コマ目・3コマ目**のコマ要約は **お客様の表情／親方の内省**を優先する一文を追加
- **`buildPanelPrompt` / `buildComicPanelPrompts`**: `comicPromptCharacters` で **親方＋お客様**表記（無音時はコパイロットは画面に出さない）
- **確認**: `http://127.0.0.1:8787/` が **200** で応答（同一オリジンで「構成を生成」可能）。**本題材**は `buildAllOutputs` で **4コマ・統合プロンプト・note** を再確認

### 現在の状態

- **4コマ構成**と**統合画像プロンプト**の「誰が主役か」が、**customer_side** で揃う

## 今日やったこと（2026-03-23：漫画主導へのワークフロー転換）

### 方針

- **主役**: 実話**漫画**（タイトル・構成・コマ文・画像プロンプト）。**note**は**導入・締めの短文**を優先し、**長文本文**は折りたたみの「長文note・投稿用」に退避。**Kindle**系プレビューも折りたたみ（後段・再編集）。

### 実装

- **`js/engine.js`**: `buildAllOutputs` に **`comicTitle`**、**`noteIntroAssist`**、**`noteClosingAssist`**、**`comicEpisodeSummary`** を追加（長文 `note` / `noteBodyOnly` は維持）
- **`index.html`**: 画面上部を **漫画タイトル→構成→描画プロンプト→統合画像**、続けて **note補助（導入・締め・1行要約）**。**用途別コピー**の説明を漫画優先に。**長文note**・**Kindle**を `<details>` で主導線から分離
- **`js/app.js`**: 新出力の描画・クリア。**スタイル向けにまとめてコピー**の既定順を漫画優先に変更
- **`css/style.css`**: `.comic-primary-card` / `.note-assist-card` / 折りたたみ用スタイル
- **`README.md`** / **`ops/handoff.md`**: 方針を明記

## 今日やったこと（2026-03-23：投稿文＝漫画原稿への主軸切替）

### 方針

- **1本の原稿**（8ブロック）を **note・4コマ・画像の共通ソース**とする。**4コマ先行**ではなく **原稿→コマ分解**。**`buildAllOutputs` は `buildNote` を毎回呼ばない**（`buildComicPanelPrompts` / `buildUnifiedComicImagePrompt` は同一 `comic` を再利用）。

### 実装

- **`js/engine.js`**: **`buildComicManuscriptPost`**、**`parseManuscriptSections`**、**`formatComicFromManuscript`**、**`buildComicBundle`**。**`buildComic`** は原稿駆動。**`buildAllOutputs`**: **`comicManuscriptPost`**、**`note`/`noteBodyOnly`** を原稿ベース、**`noteIntroAssist`/`noteClosingAssist`** を原稿ブロック由来
- **`index.html` / `js/app.js`**: 先頭に **漫画化前提の投稿文（原稿）**。**スタイル向けにまとめてコピー**に原稿を先頭追加
- **`README.md` / `ops/handoff.md`**: 主軸と `buildNote` の位置づけを更新

## 今日やったこと（2026-03-23：実題材A/B・原稿→4コマ検証）

### 確認（ブラウザと同一の `js/engine.js` を Node で実行）

- **題材A**（業界の常識は顧客の非常識・芯・結論あり・現場メモなし）: 原稿は顧客側の違和感→学び→本質の流れが立つ。**note本文＝原稿**一致。**4コマ**は原稿ブロックの切り出しとして追える（導入と事件が近いのは既存の導入生成のため。今回は未改修）
- **題材B**（最安値の悲劇・芯・結論あり・現場メモなし）: 初回出力で【今なら分かる】が「確認漏れは…」に**誤爆**（価格シーンの「仕様の**確認**」に `buildFallbackLearning` の「確認」条件が反応）。**`buildFallbackLearning`**: 「確認」単独マッチをやめ、**`確認漏れ` または `漏れ`** に限定。**修正後**は【今なら分かる】が価格・客層寄りに戻り、**3コマ目の気づき**も原稿と一致

### コード

- **`js/engine.js`**: `buildFallbackLearning` の上記最小修正のみ（他ファイル未変更）

## 今日やったこと（2026-03-23：主線の軽量化・8コマネーム思想・Kindle後退）

### 方針

- **主役は漫画原稿**。**派生順**は原稿 → ネーム（現状1〜4コマ相当）→ コマ別プロンプト → 統合プロンプト → **note補助（導入・締めのみ）**。長文note・Kindleを主導線に置かない。
- **Kindle**は将来の別モードとして **折りたたみ**に集約。**「構成を生成」でKindleプレビューを自動更新しない**。

### UI・エンジン

- **`index.html`**: 主導線を **入力 → 原稿 → 8コマ標準ネーム（短縮版）→ コマ別プロンプト → 統合プロンプト → note補助** に再配置。長文note・X・章メモ・用途別コピー・Kindleを **「その他」** に集約。入力フォームから Kindle 系プレビューボタンを **その他** へ移動。
- **`js/app.js`**: 生成時の `renderKindlePreview` / `renderKindleChapterPreview` を **削除**（毎回Kindleを作らない）。
- **`js/engine.js`**: ネームラベルを **1/8〜4/8** 表記に統一。ネーム末尾のナレーションから **読者への問い**を分離。**コパイロット常時セリフ**をネームから外す（親方＋必須表現時の相棒のみ）。**実話**短い入力に仮想の「その結果〜」を足さない（`ensureIncidentText`）。プロンプト文言を **8コマネーム／短縮枠** に寄せる。
- **`README.md` / `css/style.css`**: 上記に合わせて更新。

## 今日やったこと（2026-03-23：X投稿の主線からの撤去）

### 方針

- **今は note に集中**。UI・`buildAllOutputs`・コピー導線から **X 関連を除去**。**`buildXPost`** は Kindle 節プレビュー内部向けに **`window.AIBusouEngine.buildXPost` として残置**（主導線・一括生成では呼ばない）。

### 変更

- **`index.html`**: 「その他」内の **X投稿ブロック**を削除。折りたたみ見出しから **X** 表記を削除。
- **`js/engine.js`**: **`buildAllOutputs` の `xPost` キーを削除**。
- **`js/app.js`**: **`x-output` の描画・クリア**を削除。
- **`css/style.css`**: **`.x-post-card`** を削除。
- **`README.md` / `ops/status.md` / `ops/handoff.md`**: 方針を追記・更新。

## 今日やったこと（2026-03-23：8コマ標準ネームのベースライン実装）

### 方針

- 原稿8ブロックを **1/8〜8/8 に1対1**で載せる（まずは圧縮・賢い統合はしない）。**コマ別プロンプト・統合画像プロンプト**も8コマに揃える。**旧4コマ短縮**は **`comicLegacy4`** に残す。

### 実装

- **`js/engine.js`**: **`COMIC_PANEL_LABELS`** を8コマに拡張。**`formatComicFromManuscript`** を8ブロック直出しに変更。**`formatFourPanelLegacyFromManuscript`**（旧 **`COMIC_LEGACY4`**）を追加。**`getComicPanelMetaForExtraction`**（8件）・**`buildPanelPrompt`**（表情・構図5〜8）・**`buildComicPanelPrompts` / `buildUnifiedComicImagePrompt`** の文言を8コマ前提に更新。**`buildAllOutputs`** に **`comicLegacy4`** を追加。
- **`index.html` / `README.md` / `ops/handoff.md`**: 主表示が8コマであることを明記。

## 今日やったこと（2026-03-23：実機確認観点での文言・プロンプト整合）

### 確認

- 題材A/B（業界の常識は顧客の非常識／最安値の悲劇）を想定し、**原稿→8コマ**の情報欠落は前段実装の範囲で問題なし。**統合プロンプトの顧客視点**に旧「2コマ目」表記が残る点と、**コマ別プロンプトの3〜4コマ目**が旧4コマ時代の「気づき／前進」寄りだった点を最小修正。

### 変更

- **`js/engine.js`**: `buildUnifiedComicCastLines` の **2コマ目→2/8（状況）**。**`buildPanelPrompt`** の **3/8・4/8** の表情・構図ヒントを **事件の予兆／強い一言**に寄せる。`buildXPost` のハッシュタグ **#4コマ→#8コマネーム**（Kindle節向け残置関数の整合）。
- **`index.html`**: 最終確認の **「ネーム（短縮版）」→8コマ全文であることが分かる表記**。
- **`js/app.js`**: 保存ファイル名 **`4koma-comic.png`→`comic-8panel.png`**。
- **`api/server.js`**: ファイル先頭コメント・ダミーPNG説明を **8コマ主線**に合わせる（ダミー画像の4帯仕様は疎通用として維持）。
- **`README.md` / `ops/handoff.md`**: 起動手順・API説明の **4コマ表記を8コマネーム／統合画像**に更新。

## 今日やったこと（2026-03-23：8コマ検証レビューの handoff / status 反映）

### 内容

- **コード変更なし**の確認タスクの結果を、**`ops/handoff.md` / `ops/status.md`** にのみ反映。
- **記録上の起点**: **`f03f95c`**。

### 確認結果（題材A・題材B・生成テキスト）

- 直近修正（**導入の途切れ対策**・**導入／事件の分離**・**本質／以後の重複解消**・**統合プロンプトの旧4コマ文言除去**）は**意図どおり**。
- 【導入】の欠けなし／導入と事件の分離／1/8 と 2/8 の重複感は弱まった／【本質】と【以後の行動ルール】は別文／7/8・8/8 の体裁／統合プロンプトに **`4コマ` 文字列なし**を確認。
- **未確認**: ブラウザ実機の **折り返し・スクロール位置**。

### 残違和感・次回（handoff に同趣旨で記載）

- コマラベルと原稿ブロックの対応／8/8 問いの固定文は **別タスク候補**。

## 今日やったこと（2026-03-24：主線外の旧4コマ表記整理）

### 方針

- **主線（原稿・8コマ・統合プロンプト）のロジックは触らない**。`templates.js` の **未使用・参照用**の旧「4コマ」系表記と、**コメント1行**のみ整理。

### 変更

- **`js/templates.js`**: **`unifiedImagePrompt.panelArchetype`** を **1/8〜4/8（例）** 表記に。**`comicBaseTemplate.panel4`**（未使用）の締め文を **余韻・問い**に合わせる。
- **`js/engine.js`**: **`buildNoteClosingNoConclusionTied` 周辺コメント**のみ（**挙動変更なし**）。
- **`ops/handoff.md` / `ops/status.md`**: 上記を追記。

## 今日やったこと（2026-03-24：主線外 `docs/` 表記整合）

### 内容

- **対象**: `docs/chapter-mapping-examples.md`, `docs/evaluation-guide.md`, `docs/evaluation-log.md`, `docs/sample-section-drafts.md`, `docs/sample-section-draft-v2.md`, `docs/sample-kindle-chapter-outline.md`, `docs/sample-kindle-chapter-draft-v1.md`, `docs/sample-kindle-chapter-draft-v2.md`
- **方針**: 「4コマが標準」「X が主線」「毎回 Kindle 同時生成」と読める説明だけを **最小差分**で、**漫画原稿＝一次ソース・8コマ標準ネーム・note 主線／旧4コマは旧形式／X は主線外／Kindle は将来の別モード** に合わせた。旧機能の記述そのものは削除していない。

### 未変更

- **`README.md`**、コード本体、**`index.html`／UI ラベル**は触っていない。

## 今日やったこと（2026-03-24：8コマネーム 3/8〜6/8 ラベル整合）

### 内容

- **`js/engine.js`**: **`COMIC_PANEL_LABELS`** の **p3〜p6**（3/8〜6/8）を、原稿の **【強い一言】【当時の自分の認識】【今なら分かる】【本質】** に対応する表現に変更。**`getComicPanelMetaForExtraction`** の **`name`**（描画・統合プロンプトの見出し用）と、**芯固定**の「ネームの流れ」一行を同趣旨で更新。
- **未変更**: 原稿生成の **1/8〜7/8**、ブロック順、`formatComicFromManuscript` の割り当て、**UI・README**。

## 今日やったこと（2026-03-24：8/8 読者への問い・題材軸）

### 内容

- **`js/engine.js`**: **`buildReaderQuestionForManuscript`** を追加。原稿の【読者への問い】のみを **`topicAxis`** に応じて一文に分岐（`customer_side`・`price` / `customer_fit`・その他フォールバック）。**他ブロックの生成ロジック・順序は未変更**。

## 今日やったこと（2026-03-24：8/8 読者への問い・site_ops）

### 内容

- **`js/engine.js`**: **`buildReaderQuestionForManuscript`** に **`site_ops`** 分岐を **一文だけ**追加（手順・仕組み・再発防止に寄せる問い）。**他 `topicAxis`・1/8〜7/8 は未変更**。

## 今日やったこと（2026-03-24：customer_side【事件】の自然さ）

### 内容

- **`js/engine.js`**: 見積・専門用語系の **【事件】** 候補と **`frictionFromIncident`（customer_side）** の一文を、口語として不自然になりやすい台詞表現から **地の文**へ最小差分で調整。

## 今日やったこと（2026-03-24：customer_side【今なら分かる】・行動ルール）

### 内容

- **`js/engine.js`**: **`buildFallbackLearning`**（`customer_side`）と **`buildNoteConclusionNextLine`**（`customer_side` 分岐追加）を、**5/8・7/8 相当の本文**が生成文っぽくならないよう最小調整。

## 今日やったこと（2026-03-24：customer_side 原稿8ブロックの自然化）

### 内容

- **`js/engine.js`**: シーン・反転・学び・行動の **customer_side 経路**と、原稿の【強い一言】【本質】の **軽い整形**を追加し、題材A/D で **通しの文体**を実話寄りに寄せた。

## 今日やったこと（2026-03-24：customer_side 2/8・3/8・5/8・7/8 生成経路の再調整）

### 内容

- **`js/engine.js`**: **`concreteSceneBank` / `pickOneConcreteScene`**（相手の相づち・聞き返しの変化）、**`frictionFromIncident`（customer_side）`**、**`buildFallbackLearning`**（後悔と気づきを **一文**に収め `firstSentenceJapanese` で切られないよう句点を一つに）、**`buildNoteConclusionNextLine`**（自分への決め）、**`polishCustomerSideManuscriptPunch`**（体感寄りの短文）を **customer_side のみ**最小差分で調整。

## 現在の状態（2026-03-24 更新）

- **`main`**: **`ca3b90d`** — `fix: refine customer-side manuscript voice after naturalization pass`（**origin/main** と一致想定。`git pull` 済みなら同一）
- **customer_side**: 題材A/D 想定の **8ブロック／8コマネーム**で、**【事件】の反応描写**・**【今なら分かる】の一句化（5/8 欠落防止）**・**【以後の行動ルール】の自分への決め**まで反映済み
- **次に見るなら（任意）**: 手入力の **学び** が長いときの **5/8**（`firstSentenceJapanese`）、**4/8・6/8** の追加微調整は別タスク

## 今日やったこと（2026-03-24：customer_side 4/8・5/8・7/8 確定文）

- **`js/engine.js`**: `pickNoteTurnForTopicAxis`（customer_side・標準）／`buildFallbackLearning`（customer_side）／`buildNoteConclusionNextLine`（customer_side）の **3箇所のみ**を確定文案へ差し替え（**8/8・他軸・templates・UI は未変更**）
- **`ops/handoff.md` / `ops/status.md`**: 上記を最小追記
