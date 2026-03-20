# status

## プロジェクト目的
- 現場の出来事から「4コマ漫画構成 / note記事本文 / X投稿文」を1画面で生成する。
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
- X投稿テンプレの精度向上

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
