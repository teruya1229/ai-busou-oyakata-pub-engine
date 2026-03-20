# handoff

## 実API接続・仕様確認チェックリスト（差し替え指針）

実APIの契約が固まったら、まず下記を **1枚のメモ（URL・サンプルreq/res）** に落とし、`js/app.js` を **次の3箇所だけ** 意識して触る。

| 観点 | 現状（コード上の事実） | 確定時に決めること |
|------|------------------------|----------------------|
| **URL** | 既定 **`http://127.0.0.1:8787/api/comic-image`**（`COMIC_IMAGE_API_CONFIG.url`）。本番は README 例のとおり差し替え | 運用ドメイン確定後に `url` のみ更新 |
| **HTTP method** | `POST` 固定（`requestComicImage`） | `GET` 等なら `fetch` の `method` を変更 |
| **request body** | `JSON.stringify({ prompt: promptText })` | キー名が `text` / `input` / `messages` 等なら **この1行** を合わせる |
| **認証** | `Content-Type: application/json` のみ | `Authorization` / `x-api-key` 等が要るなら **`fetch` の `headers`** に追加。**シークレットはリポジトリに載せない**（.env・別設定・手入力など運用で決める） |
| **response JSON** | トップレベル **`imageSrc` または `dataUrl`**（文字列） | ネスト（例: `data.url`）や別キー名なら **`normalizeComicImageApiPayload` のみ** 拡張 |
| **エラー** | 非200は「HTTPステータス＋短文」、`fetch` 例外はCORS等の短文 | エラーJSON（`error.message` 等）をユーザーに見せるなら **`!res.ok` 時に `res.json()` してメッセージ抽出** を最小追加 |
| **data URL vs 通常URL** | どちらも `normalizeComicImageResult` で許可。**README・コメント上の本命は data URL** | APIが **HTTPS URL だけ** 返すならそのまま流用可。**バイナリ/base64のみ** なら **client側で `data:image/...;base64,...` に組み立て** してから `applyComicImageResult` |

### コード内の差し替えポイント（ファイル: `js/app.js`）

1. **`COMIC_IMAGE_API_CONFIG`** … 既定でローカル URL 済み。認証用の **ヘッダテンプレ** を足すならここに寄せるのが自然。
2. **`requestComicImage`** … `method` / `headers` / `body`（JSON形）の **3点** がAPI契約の本体。
3. **`normalizeComicImageApiPayload`** … レスポンスの **キー名・ネスト** をここだけで吸収し、その先は既存の **`applyComicImageResult`** に任せる。

### README / ops にある「仮仕様」の要約

- **README**: POST。req **`{ "prompt": "..." }`**。res 成功時 **`{ "imageSrc": "data:image/png;base64,..." }`**（正式キー。**HTTPS画像URL** も将来同じ `imageSrc` で返却可能）。初期認証なし。互換で `dataUrl` も解釈可。
- **ops/status.md**: フロント既定 URL 固定済み。**次はバックエンド**：下記「次にやるべき1手」。

## 次にやるべき1手
- **`api/server.js` 先頭の `USE_DUMMY` を `false` にし、`async function generateImage(prompt)` の中身を本物の画像生成呼び出しへ差し替える**（ダミーPNGではなく実運用の戻りを **data URL または `imageSrc` 用URL** で返す）。
- PHASE 1 として **`api/` の Express サーバ**は既に **`POST /api/comic-image`** で **ダミー `{ imageSrc }`** を返せる。**フロントは変更不要**。

## その次の候補（1つに絞ってから着手）
- **ローカル画像**（フロントのみ）：ファイル選択で `FileReader.readAsDataURL` → **`applyComicImageResult`**

## 判断基準
- **画像はダミーで十分**なら `USE_DUMMY = true` のまま運用検証のみ。本物に移るときだけ `false` と `generateImage` を編集
- **フロントから本番API**を直叩きする場合は `js/app.js` の `COMIC_IMAGE_API_CONFIG.url` と **必要なヘッダ**を最小追加（秘匿情報はコミットしない）
- **file:// で開いてCORSで詰まる**なら、同一オリジンで `index.html` を配る、またはAPIでCORSを許可する（実装範囲はインフラ次第）
- **共通**：4コマ / note / X / Kindle と `js/kindle-engine.js` を壊さない

## 注意点
- **`api/server.js`** は依存 **`express` のみ**。ポート **8787** とパス **`/api/comic-image`** をフロント既定と揃えている
- `generateImage` が例外や空を返すと **500** になる。外部APIは try/catch とタイムアウトを段階的に足す
- フロントの `requestComicImage` は **JSON の `imageSrc` または `dataUrl`** を想定。APIレスポンス形を変えるなら **フロントの `normalizeComicImageApiPayload` だけ**検討
- **`normalizeComicImageResult` の `javascript:` 拒否**は維持する
- リセットは **`resetComicImagePreview`** が API ステータスと生成ボタン disabled も戻す

## 今回やらないこと
- 永続化・生成履歴の本実装
- 複数APIプロバイダの抽象層
- Kindle / note / X の変更

## 実装方針
- ルールベースMVPを維持し、Kindleは `js/kindle-engine.js`
- 画像まわりは `js/app.js` の **定数＋数関数** に留める

## 次の拡張候補
- APIキー用の入力欄1つ（localStorage は慎重に）
- 429/5xx のユーザー向け一言
- 生成結果のコピーボタン（data URL 用・注意書き付き）
