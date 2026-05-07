import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Concept #7 — Underline: navy rounded rect, bold "pl", orange accent line
export default function AppleIcon() {
  const s = 180
  // Proportionally scaled from 512×512 master SVG
  const ulX = Math.round((80 / 512) * s)       // 28
  const ulY = Math.round((400 / 512) * s)       // 141
  const ulW = Math.round((352 / 512) * s)       // 124
  const ulH = Math.max(8, Math.round((28 / 512) * s)) // 10
  const ulR = Math.round((14 / 512) * s)        // 5

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          background: '#0F172A',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          borderRadius: Math.round((72 / 512) * s),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            color: '#F8FAFC',
            fontSize: Math.round((310 / 512) * s),
            fontWeight: 900,
            fontFamily: 'Arial, Helvetica, sans-serif',
            lineHeight: 1,
            marginTop: Math.round((60 / 512) * s),
          }}
        >
          pl
        </span>
        <div
          style={{
            position: 'absolute',
            left: ulX,
            top: ulY,
            width: ulW,
            height: ulH,
            borderRadius: ulR,
            background: '#F97316',
          }}
        />
      </div>
    ),
    { width: s, height: s },
  )
}
