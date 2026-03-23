/**
 * 漫画統合画像生成API（8コマネーム用プロンプト想定）+ 同一オリジンでリポジトリ直下の静的フロントを配信
 * USE_DUMMY=true: ダミーPNG（疎通用）
 * USE_DUMMY=false: OpenAI Images API（既定モデル gpt-image-1.5）
 *   失敗時（キー未設定・課金上限・quota・認証・上流5xx 等）はダミーPNGへフォールバック（導線確認用。本番では厳格化可）
 *
 * 環境: api/.env に OPENAI_API_KEY（api/.env.example をコピー）
 *
 * 起動確認例:
 *   cd api && npm install && npm start
 *   ブラウザで http://127.0.0.1:8787/ （フロント） / POST /api/comic-image は同一オリジン
 *   curl -X POST http://127.0.0.1:8787/api/comic-image -H "Content-Type: application/json" -d "{\"prompt\":\"テスト\"}"
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const zlib = require("zlib");
const OpenAI = require("openai");

const USE_DUMMY = false;

/** 第一候補。API側で未提供の場合は OPENAI_IMAGE_MODEL または gpt-image-1 等へ変更 */
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";

const PORT = 8787;

/** リポジトリルート（api/ の1つ上）。index.html / css / js を配信し、api/ 配下は露出しない */
const REPO_ROOT = path.join(__dirname, "..");

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/**
 * 視認しやすいダミーPNG（200x120）。1×1ではない。
 * 縦4帯の色分けの簡易プレースホルダー（本番プロンプトは8コマネーム。疎通確認用）。
 */
function makeDummyComicPlaceholderDataUrl() {
  const width = 200;
  const height = 120;
  const bands = [
    [255, 230, 200],
    [200, 235, 255],
    [220, 255, 220],
    [245, 220, 255],
  ];
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    const band = Math.min(3, Math.floor((y / height) * 4));
    const r = bands[band][0];
    const g = bands[band][1];
    const b = bands[band][2];
    for (let x = 0; x < width; x++) {
      const i = rowStart + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  return "data:image/png;base64," + png.toString("base64");
}

function isOpenAiKeyConfigured() {
  const k = process.env.OPENAI_API_KEY;
  if (!k || typeof k !== "string") {
    return false;
  }
  const t = k.trim();
  if (!t) {
    return false;
  }
  if (t.indexOf("ここに") >= 0) {
    return false;
  }
  return true;
}

function shortOpenAiErrorMessage(err) {
  if (!err) {
    return "不明なエラー";
  }
  const nested = err.error;
  const code =
    (nested && (nested.code || nested.type)) ||
    err.code ||
    (err.response && err.response.data && err.response.data.error && err.response.data.error.code);
  const msg = err.message || (nested && nested.message) || "";
  const status = err.status || err.statusCode;
  const parts = [];
  if (code) {
    parts.push(String(code));
  }
  if (msg) {
    parts.push(msg);
  }
  if (status) {
    parts.push("HTTP " + status);
  }
  return parts.filter(Boolean).join(" / ") || String(err);
}

/**
 * OpenAI Images API → フロント契約どおり data:image/png;base64,... の1本
 * 失敗時は throw（呼び出し側でダミーへフォールバック）
 */
async function generateImage(prompt) {
  if (!isOpenAiKeyConfigured()) {
    throw new Error(
      "OPENAI_API_KEY が未設定です。api/.env.example を api/.env にコピーし、有効なキーを設定してください。",
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY.trim() });
  const response = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt: prompt,
    n: 1,
    size: "auto",
    output_format: "png",
  });

  const item = response.data && response.data[0];
  if (!item) {
    throw new Error("画像データがありません");
  }

  let b64 = item.b64_json;
  if (!b64 && item.url) {
    const r = await fetch(item.url);
    if (!r.ok) {
      throw new Error("画像URLの取得に失敗しました");
    }
    const buf = Buffer.from(await r.arrayBuffer());
    b64 = buf.toString("base64");
  }
  if (!b64) {
    throw new Error("画像の取得に失敗しました");
  }

  return "data:image/png;base64," + b64;
}

function corsAllow(req, res, next) {
  const origin = req.headers.origin;
  if (
    origin === undefined ||
    origin === "null" ||
    /^https?:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin) ||
    /^file:\/\//i.test(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
}

const app = express();
app.use(corsAllow);
app.use(express.json({ limit: "2mb" }));

app.options("/api/comic-image", function (req, res) {
  res.sendStatus(204);
});

app.post("/api/comic-image", async function (req, res) {
  try {
    const prompt = req.body && req.body.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }

    let imageSrc = "";
    let usedFallback = false;

    if (USE_DUMMY) {
      imageSrc = makeDummyComicPlaceholderDataUrl();
    } else {
      try {
        imageSrc = await generateImage(prompt.trim());
      } catch (e) {
        const msg = e && e.message ? String(e.message) : "";
        if (msg.indexOf("OPENAI_API_KEY") >= 0) {
          console.warn(
            "[comic-image] OPENAI利用不可（キー未設定）→ ダミーへフォールバック",
          );
        } else {
          console.warn("[comic-image] OpenAI失敗: " + shortOpenAiErrorMessage(e));
          console.warn("[comic-image] ダミー画像へフォールバック");
        }
        imageSrc = makeDummyComicPlaceholderDataUrl();
        usedFallback = true;
      }
      if (!imageSrc) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    const payload = { imageSrc: imageSrc };
    if (usedFallback) {
      payload.fallback = true;
    }
    return res.json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", function (req, res) {
  res.sendFile(path.join(REPO_ROOT, "index.html"));
});

app.use("/css", express.static(path.join(REPO_ROOT, "css")));
app.use("/js", express.static(path.join(REPO_ROOT, "js")));

const assetsDir = path.join(REPO_ROOT, "assets");
if (fs.existsSync(assetsDir)) {
  app.use("/assets", express.static(assetsDir));
}

app.listen(PORT, function () {
  console.log("listening http://127.0.0.1:" + PORT + "/ （静的フロント + POST /api/comic-image）");
});
