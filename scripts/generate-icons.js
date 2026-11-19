const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table for PNG chunk checksums
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Encode 32-bit BGRA bottom-up DIB for Windows ICO (< 256px)
function encodeICODIB(size, rgba) {
  const headerSize = 40;
  const xorSize = size * size * 4;
  // AND mask row stride is padded to 32 bits (4 bytes)
  const andRowBytes = Math.ceil(size / 32) * 4;
  const andSize = andRowBytes * size;

  const buf = Buffer.alloc(headerSize + xorSize + andSize);
  buf.writeUInt32LE(headerSize, 0); // biSize
  buf.writeInt32LE(size, 4); // biWidth
  buf.writeInt32LE(size * 2, 8); // biHeight (XOR + AND combined height)
  buf.writeUInt16LE(1, 12); // biPlanes
  buf.writeUInt16LE(32, 14); // biBitCount
  buf.writeUInt32LE(0, 16); // biCompression = BI_RGB
  buf.writeUInt32LE(xorSize + andSize, 20); // biSizeImage

  // Write bottom-up BGRA pixels + 1-bit AND mask
  const andOffset = headerSize + xorSize;
  for (let y = 0; y < size; y++) {
    const srcY = size - 1 - y; // bottom-up
    for (let x = 0; x < size; x++) {
      const srcIdx = (srcY * size + x) * 4;
      const dstIdx = headerSize + (y * size + x) * 4;
      const r = rgba[srcIdx];
      const g = rgba[srcIdx + 1];
      const b = rgba[srcIdx + 2];
      const a = rgba[srcIdx + 3];
      buf[dstIdx] = b;
      buf[dstIdx + 1] = g;
      buf[dstIdx + 2] = r;
      buf[dstIdx + 3] = a;

      if (a === 0) {
        const byteIndex = andOffset + y * andRowBytes + (x >> 3);
        buf[byteIndex] |= 1 << (7 - (x & 7));
      }
    }
  }

  return buf;
}

function sdRoundedBox(nx, ny, halfW, halfH, radius) {
  const qx = Math.abs(nx - 0.5) - halfW + radius;
  const qy = Math.abs(ny - 0.5) - halfH + radius;
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - radius;
}

function inRect(nx, ny, x0, y0, x1, y1, r = 0.008) {
  const cx = (x0 + x1) * 0.5;
  const cy = (y0 + y1) * 0.5;
  const hw = (x1 - x0) * 0.5;
  const hh = (y1 - y0) * 0.5;
  const qx = Math.abs(nx - cx) - hw + r;
  const qy = Math.abs(ny - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r <= 0;
}

function sampleIcon(nx, ny) {
  const distBadge = sdRoundedBox(nx, ny, 0.45, 0.45, 0.19);
  if (distBadge > 0) {
    return [0, 0, 0, 0];
  }

  const borderInner = -0.024;
  const isBorder = distBadge >= borderInner;

  const sw = 0.088;
  const yTop = 0.23;
  const yBot = 0.77;
  const yMid = 0.465;

  const fStem = inRect(nx, ny, 0.21, yTop, 0.21 + sw, yBot, 0.012);
  const fTopBar = inRect(nx, ny, 0.21, yTop, 0.475, yTop + sw, 0.012);
  const fMidBar = inRect(nx, ny, 0.21, yMid, 0.435, yMid + sw * 0.9, 0.012);

  const lStem = inRect(nx, ny, 0.545, yTop, 0.545 + sw, yBot, 0.012);
  const lBotBar = inRect(nx, ny, 0.545, yBot - sw, 0.805, yBot, 0.012);

  const isLetter = fStem || fTopBar || fMidBar || lStem || lBotBar;

  if (isLetter) {
    const t = (ny - yTop) / (yBot - yTop);
    const r = Math.round(252 - t * 22);
    const g = Math.round(224 - t * 38);
    const b = Math.round(108 - t * 52);
    return [r, g, b, 255];
  }

  if (isBorder) {
    const t = ny;
    const r = Math.round(240 - t * 35);
    const g = Math.round(202 - t * 38);
    const b = Math.round(78 - t * 30);
    return [r, g, b, 255];
  }

  const dx = nx - 0.5;
  const dy = ny - 0.45;
  const rad = Math.min(1, Math.hypot(dx, dy) / 0.55);
  const r = Math.round(34 - rad * 14);
  const g = Math.round(29 - rad * 12);
  const b = Math.round(18 - rad * 8);
  return [r, g, b, 255];
}

function renderRawRGBA(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const samples = 4;
  const totalSamples = samples * samples;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let rSum = 0,
        gSum = 0,
        bSum = 0,
        aSum = 0;

      for (let sy = 0; sy < samples; sy++) {
        const ny = (y + (sy + 0.5) / samples) / size;
        for (let sx = 0; sx < samples; sx++) {
          const nx = (x + (sx + 0.5) / samples) / size;
          const [r, g, b, a] = sampleIcon(nx, ny);
          const alphaNorm = a / 255;
          rSum += r * alphaNorm;
          gSum += g * alphaNorm;
          bSum += b * alphaNorm;
          aSum += a;
        }
      }

      const idx = (y * size + x) * 4;
      const finalA = Math.round(aSum / totalSamples);
      if (finalA > 0) {
        const weight = aSum / 255;
        rgba[idx] = Math.min(255, Math.round(rSum / weight));
        rgba[idx + 1] = Math.min(255, Math.round(gSum / weight));
        rgba[idx + 2] = Math.min(255, Math.round(bSum / weight));
        rgba[idx + 3] = finalA;
      }
    }
  }

  return rgba;
}

function createMultiResICO(layers) {
  const count = layers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  let offset = 6 + count * 16;

  for (const item of layers) {
    const entry = Buffer.alloc(16);
    entry[0] = item.size >= 256 ? 0 : item.size;
    entry[1] = item.size >= 256 ? 0 : item.size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += item.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...layers.map((e) => e.data)]);
}

const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoLayers = icoSizes.map((sz) => {
  const rgba = renderRawRGBA(sz);
  return {
    size: sz,
    // DIB for <256 and PNG for 256: 100% compliant with Windows Explorer, Taskbar, rcedit & NSIS
    data: sz === 256 ? encodePNG(sz, sz, rgba) : encodeICODIB(sz, rgba),
  };
});

const icoBuffer = createMultiResICO(icoLayers);
const rgba512 = renderRawRGBA(512);
const png512 = encodePNG(512, 512, rgba512);

const rootDir = path.resolve(__dirname, '..');
fs.writeFileSync(path.join(rootDir, 'assets', 'icon.ico'), icoBuffer);
fs.writeFileSync(path.join(rootDir, 'assets', 'icon.png'), png512);
fs.writeFileSync(path.join(rootDir, 'src', 'renderer', 'assets', 'icon.png'), png512);
if (fs.existsSync(path.join(rootDir, 'dist', 'renderer', 'assets'))) {
  fs.writeFileSync(path.join(rootDir, 'dist', 'renderer', 'assets', 'icon.png'), png512);
}

console.log('Generated Windows DIB+PNG multi-res icon.ico and 512x512 icon.png successfully!');
