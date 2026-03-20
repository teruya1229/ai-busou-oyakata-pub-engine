# handoff

## 次にやるべき1手（どちらか一方だけ）
- **A)** 選んだ画像生成APIの **fetch（または公式SDKの1呼び出し）** だけを `js/app.js` に足し、レスポンスから **data URL 1本**（推奨）を組み立てたうえで `AIBusouComicImageAdapter.applyComicImageResult(...)` を呼ぶ
- **B)** URL / data URL に加え、**ローカル画像（ファイル選択 or ドラッグ）** を `FileReader` で `data:` にし、同じアダプターまたは既存欄へ流す最小導線を足す

## 判断基準
- **ホスト制約・CORS・トークン** が既に決まっているなら A を先に。まだサービス未定なら B でオフライン確認を厚くするのが安全
- APIが **バイナリBlob** しか返さない場合は、`FileReader.readAsDataURL` などで **最終的に data URL 1本** に寄せてから `applyComicImageResult` へ渡す（正規化はアダプター外でも可）
- **共通**：4コマ / note / X / Kindle と `js/kindle-engine.js` を壊さない。`javascript:` 等は引き続き拒否

## 注意点
- 既存の手入力・「4コマ画像を表示」・リセットは維持すること
- `normalizeComicImageResult` の分岐を増やしすぎない（まず **string / { imageSrc }** で足りる見込み）
- 本格のリトライ・キュー・設定画面は「今回やらない」に戻す

## 今回やらないこと
- 永続化（保存/履歴）
- APIの選定・認証基盤・エラー設計の一式
- Kindle用出力の変更
- 複数画面化・大規模抽象化

## 実装方針
- ルールベースMVPを維持し、Kindleは `js/kindle-engine.js` に寄せる
- UIは「追加ボタン・1行説明」程度に抑え、フレームワーク化しない

## 次の拡張候補
- APIキーを `prompt` ではなく入力欄1つに置く（最小）
- 429/5xx のユーザー向け一言メッセージ
- 生成履歴（将来）
