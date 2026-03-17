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
