# Kindle実装設計計画 v1

## 1. このドキュメントの目的
- `docs/kindle-generation-rules-v1.md` を実装に落とすための責務分離とデータ構造を整理する。
- 既存MVPを壊さず、Kindle向けの節素材/章素材生成を追加する設計基準を固定する。

## 2. なぜ今、量産試作ではなく実装設計へ進むのか
- 生成ルールは整理済みで、次は実装単位を明確化しないと開発時に責務が混在しやすい。
- 先に設計を固定することで、最小実装時の改修範囲を限定できる。
- 保留項目を除く固定ルールは確定しており、実装設計に進む条件が満たされている。

## 3. 前提として使う既存ドキュメント
- `docs/kindle-generation-rules-v1.md`
- `docs/kindle-chapter-template.md`
- `docs/kindle-drafting-rules-v1.md`
- `docs/kindle-granularity-policy-v1.md`
- `docs/sample-section-draft-v2.md`
- `docs/sample-kindle-chapter-draft-v2.md`

## 4. 実装対象の全体像
- 既存入力（現場メモ一式）を正規化し、エピソード中間構造へ変換する。
- 中間構造から既存の 4コマ / note / X 出力を再利用生成する。
- 生成済み3出力を Kindle節素材へ変換し、4節単位で Kindle章素材へ束ねる。
- 最初の目標は「完成原稿」ではなく「節素材/章素材」を返す機能までとする。

## 5. どこまでをMVP拡張として実装するか
- 対象:
  - 入力 -> 中間構造
  - 中間構造 -> 既存3出力再利用
  - 3出力 -> Kindle節素材
  - 複数節 -> Kindle章素材（標準4節、例外3節）
- 非対象:
  - Kindle本文自動生成
  - EPUB出力
  - 保存/履歴
  - API連携

## 6. 入力データ構造案
```js
{
  titleTheme: string,
  incident: string,
  lesson: string,
  characters: string,
  tone: "ゆるい" | "少し真面目" | "かなり真面目" | "コミカル"
}
```

## 7. 中間構造データ案
```js
{
  episodeId: string,
  theme: string,
  incident: string,
  cause: string,
  action: string,
  learning: string,
  tone: string,
  characters: string[],
  pattern: "misunderstanding" | "closeCall" | "awareness"
}
```

## 8. Kindle節素材データ案
```js
{
  episodeId: string,
  sectionTitle: string,
  introHook: string,        // 4コマ由来
  bodyParagraphs: string[], // 4段落
  sectionPoint: string,     // 節末要点1文（〜する。）
  sourceRefs: {
    comic: string,
    note: string,
    x: string
  }
}
```

## 9. Kindle章素材データ案
```js
{
  chapterId: string,
  chapterTitle: string,
  chapterLead: string,
  sections: Array<KindleSectionMaterial>, // 標準4件
  chapterSummaryPoints: string[],          // 2〜3点
  nextChapterBridge: string
}
```

## 10. 既存 engine.js / templates.js とどう分離するか
- `engine.js`:
  - 既存の 4コマ / note / X 生成は維持。
  - Kindle用の変換入口関数のみ追加し、既存関数を呼び出して再利用する。
- `templates.js`:
  - 既存テンプレは維持。
  - Kindle用タイトル語彙や章まとめテンプレが必要な場合のみ最小追加する。
- 分離原則:
  - 既存MVP出力ロジックと Kindle変換ロジックを同一関数に混ぜない。

## 11. 新たに必要になりそうな責務
- 入力正規化責務（欠損補完・文字列整形）
- 中間構造化責務（事実/原因/行動/学び抽出）
- 節素材化責務（3出力 -> 導入/本文/要点）
- 章素材化責務（節束ね・章タイトル・章まとめ）
- ルール検証責務（段落数・文末・構成順チェック）

## 12. 関数レベルで必要そうな処理一覧
- `buildEpisodeModel(input)`
- `buildKindleSectionMaterial(episodeModel, outputs)`
- `buildSectionTitle(episodeModel, outputs)`
- `buildSectionPoint(episodeModel, outputs)`
- `buildKindleChapterMaterial(sectionMaterials, theme)`
- `buildChapterTitle(sectionMaterials)`
- `buildChapterSummary(sectionMaterials)`
- `validateKindleMaterialRules(material)`

## 13. 実装順の推奨ステップ
1. 中間構造生成関数を追加（既存UIには未接続）。
2. 既存 `buildComic/buildNote/buildXPost` を使った節素材化関数を追加。
3. 4節を束ねる章素材化関数を追加。
4. ルール検証関数（段落数・文末）を追加。
5. サンプル入力で手動検証し、既存MVPに影響がないことを確認。

## 14. 今はまだ実装しないもの
- 完成原稿の自動生成
- EPUB/組版出力
- 保存/履歴機能
- 外部API連携
- UIでの章編集機能

## 15. 想定リスク
- 既存出力ロジックと Kindle変換責務の混在による回帰。
- 中間構造の項目不足による節要点の品質低下。
- 節素材の語彙重複が章通しで目立つ可能性。
- 保留項目（章導入長さ上限・語彙差ガイド）未確定による再調整。

## 16. 次フェーズで最初に着手すべき実装単位
- 最初の1手は `buildEpisodeModel(input)` と `buildKindleSectionMaterial(...)` の追加。
- 理由:
  - 既存3出力の再利用性を保ったまま、Kindle変換責務を切り出せる。
  - 最小差分で節素材生成まで到達でき、章素材化へ段階的に進める。
