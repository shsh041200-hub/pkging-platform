import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Concept #10 — Modular Grid apple-touch-icon (180×180)
export default function AppleIcon() {
  const s = 180
  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          background: '#F1F5F9',
          display: 'flex',
          position: 'relative',
          borderRadius: 40,
        }}
      >
        {/* Outer border */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 40,
            border: '2px solid #E2E8F0',
          }}
        />

        {/* Row 1 — outline cell + filled cell */}
        <div style={{ position: 'absolute', left: 34, top: 34, width: 62, height: 46, border: '4px solid #94A3B8', borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: 107, top: 34, width: 40, height: 46, background: '#CBD5E1', borderRadius: 6 }} />

        {/* Row 2 — filled + outline + accent */}
        <div style={{ position: 'absolute', left: 34, top: 90, width: 40, height: 56, background: '#94A3B8', borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: 84, top: 90, width: 30, height: 56, border: '4px solid #94A3B8', borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: 124, top: 90, width: 23, height: 56, background: '#0A0F1E', borderRadius: 6 }} />
      </div>
    ),
    { width: s, height: s },
  )
}
