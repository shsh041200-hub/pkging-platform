import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Concept #7 — Underline: navy rounded rect, bold "pl", orange accent line (32×32)
export default function Icon() {
  const s = 32
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
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            color: '#F8FAFC',
            fontSize: 19,
            fontWeight: 900,
            fontFamily: 'Arial, Helvetica, sans-serif',
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          pl
        </span>
        {/* Orange underline: proportional to 512×512 master */}
        <div
          style={{
            position: 'absolute',
            left: 5,
            top: 25,
            width: 22,
            height: 2,
            borderRadius: 1,
            background: '#F97316',
          }}
        />
      </div>
    ),
    { width: s, height: s },
  )
}
