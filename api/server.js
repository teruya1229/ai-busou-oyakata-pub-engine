/**
 * 4コマ漫画画像生成API（PHASE 1: ダミー data URL 返却）
 * USE_DUMMY を false にし、generateImage() 内を本物生成へ差し替え可能。
 *
 * 起動確認例:
 *   cd api && npm install && npm start
 *   curl -X POST http://127.0.0.1:8787/api/comic-image -H "Content-Type: application/json" -d "{\"prompt\":\"テスト\"}"
 */

const express = require("express");
const zlib = require("zlib");

const USE_DUMMY = true;

const PORT = 8787;

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
 * 縦4帯の色分けで「4コマ漫画テスト」プレースホルダーとして疎通確認しやすい。
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

/** 将来: 本物API呼び出しへ差し替え。今は空実装。 */
async function generateImage(prompt) {
  return "";
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
    if (USE_DUMMY) {
      imageSrc = makeDummyComicPlaceholderDataUrl();
    } else {
      imageSrc = await generateImage(prompt.trim());
      if (!imageSrc) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    return res.json({ imageSrc: imageSrc });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, function () {
  console.log("comic-image-api listening on http://127.0.0.1:" + PORT);
});
