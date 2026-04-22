/**
 * Generates favicon.ico (multi-size) from Concept #10 SVG design.
 * Uses sharp to render SVG → PNG at 16/32/48/256, then packs into ICO format.
 * Run: node scripts/generate-favicon.mjs
 */

import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Concept #10 — Modular Grid (light tone) SVG source
// This matches boxter-favicon.svg and apple-icon.tsx exactly.
function buildSvg(size) {
  const s = size
  const rx = Math.round(s * 0.22)      // corner radius ~22% of size
  const pad = Math.round(s * 0.1875)   // 6/32 = 18.75% padding

  // Row 1 layout (proportional to 32px reference)
  const r1x1 = pad
  const r1y1 = pad
  const r1w1 = Math.round(s * 0.34375) // 11/32
  const r1h1 = Math.round(s * 0.25)    // 8/32
  const r1x2 = Math.round(s * 0.59375) // 19/32
  const r1w2 = Math.round(s * 0.21875) // 7/32

  // Row 2 layout
  const r2y = Math.round(s * 0.5)      // 16/32
  const r2w1 = Math.round(s * 0.21875) // 7/32
  const r2h = Math.round(s * 0.3125)   // 10/32
  const r2x2 = Math.round(s * 0.46875) // 15/32
  const r2w2 = Math.round(s * 0.15625) // 5/32
  const r2x3 = Math.round(s * 0.6875)  // 22/32
  const r2w3 = Math.round(s * 0.125)   // 4/32

  const sw = Math.max(1, Math.round(s * 0.0375)) // stroke-width proportional

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" fill="none">
  <rect width="${s}" height="${s}" rx="${rx}" fill="#F1F5F9"/>
  <rect x="0.5" y="0.5" width="${s - 1}" height="${s - 1}" rx="${rx - 0.5}" fill="none" stroke="#E2E8F0"/>
  <!-- Row 1 -->
  <rect x="${r1x1}" y="${r1y1}" width="${r1w1}" height="${r1h1}" rx="1" fill="none" stroke="#94A3B8" stroke-width="${sw}"/>
  <rect x="${r1x2}" y="${r1y1}" width="${r1w2}" height="${r1h1}" rx="1" fill="#CBD5E1"/>
  <!-- Row 2 -->
  <rect x="${r1x1}" y="${r2y}" width="${r2w1}" height="${r2h}" rx="1" fill="#94A3B8"/>
  <rect x="${r2x2}" y="${r2y}" width="${r2w2}" height="${r2h}" rx="1" fill="none" stroke="#94A3B8" stroke-width="${sw}"/>
  <rect x="${r2x3}" y="${r2y}" width="${r2w3}" height="${r2h}" rx="1" fill="#0A0F1E"/>
</svg>`
}

// ICO format packing (PNG-based, modern format)
function packIco(pngBuffers, sizes) {
  const count = pngBuffers.length
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * count
  let dataOffset = headerSize + dirSize

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)  // reserved
  header.writeUInt16LE(1, 2)  // type: ICO
  header.writeUInt16LE(count, 4)

  const dirEntries = []
  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(16)
    const sz = sizes[i]
    entry.writeUInt8(sz === 256 ? 0 : sz, 0)   // width (0 = 256)
    entry.writeUInt8(sz === 256 ? 0 : sz, 1)   // height
    entry.writeUInt8(0, 2)                      // color count
    entry.writeUInt8(0, 3)                      // reserved
    entry.writeUInt16LE(1, 4)                   // planes
    entry.writeUInt16LE(32, 6)                  // bit count
    entry.writeUInt32LE(pngBuffers[i].length, 8)
    entry.writeUInt32LE(dataOffset, 12)
    dataOffset += pngBuffers[i].length
    dirEntries.push(entry)
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers])
}

async function main() {
  const sizes = [16, 32, 48, 256]
  const pngs = []

  console.log('Generating Concept #10 favicon sizes...')
  for (const size of sizes) {
    const svg = buildSvg(size)
    const png = await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toBuffer()
    pngs.push(png)
    console.log(`  ${size}x${size}: ${png.length} bytes`)
  }

  const ico = packIco(pngs, sizes)
  const dest = join(ROOT, 'src', 'app', 'favicon.ico')
  writeFileSync(dest, ico)
  console.log(`\nWritten: ${dest} (${ico.length} bytes)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
