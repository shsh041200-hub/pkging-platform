#!/usr/bin/env node
// Generates favicon.ico (16×16 + 32×32) for Concept #7 Underline design

const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const PROJECT_ROOT = path.resolve(__dirname, '..')

// Concept #7 SVG — uses viewBox so it scales cleanly to any size
// Text rendered as system Arial/Helvetica by librsvg
const SVG_SRC = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="72" fill="#0F172A"/>
  <text x="256" y="300" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="310" font-weight="900" fill="#F8FAFC">pl</text>
  <rect x="80" y="400" width="352" height="28" rx="14" fill="#F97316"/>
</svg>`

function buildIco(pngBuffers) {
  // ICO format: ICONDIR + N × ICONDIRENTRY + image data
  // ICONDIR  = idReserved(2) + idType(2) + idCount(2)
  // ICONDIRENTRY = bWidth(1) + bHeight(1) + bColorCount(1) + bReserved(1) + wPlanes(2) + wBitCount(2) + dwBytesInRes(4) + dwImageOffset(4)
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  let offset = headerSize

  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)     // reserved
  header.writeUInt16LE(1, 2)     // type: 1 = ICO
  header.writeUInt16LE(count, 4)

  const entries = []
  for (const { buf, size } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size === 256 ? 0 : size, 0)  // width (0 means 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1)  // height
    entry.writeUInt8(0, 2)      // colorCount (0 = no palette)
    entry.writeUInt8(0, 3)      // reserved
    entry.writeUInt16LE(1, 4)   // planes
    entry.writeUInt16LE(32, 6)  // bit count (32-bit RGBA)
    entry.writeUInt32LE(buf.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += buf.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buf)])
}

async function main() {
  const svgBuf = Buffer.from(SVG_SRC)

  const [png16, png32] = await Promise.all([
    sharp(svgBuf).resize(16, 16).png().toBuffer(),
    sharp(svgBuf).resize(32, 32).png().toBuffer(),
  ])

  const ico = buildIco([
    { buf: png16, size: 16 },
    { buf: png32, size: 32 },
  ])

  const dest = path.join(PROJECT_ROOT, 'src', 'app', 'favicon.ico')
  fs.writeFileSync(dest, ico)
  console.log(`favicon.ico written (${ico.length} bytes) → ${dest}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
