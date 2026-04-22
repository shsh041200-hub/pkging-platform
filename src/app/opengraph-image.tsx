import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BOXTER — 전국 패키징 파트너, 한 번에'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Concept #10 — Modular Grid (light tone) OG image
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#FFFFFF',
          display: 'flex',
          position: 'relative',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* ===== MODULAR GRID CELLS — LEFT SIDE ===== */}

        {/* Row 1 */}
        <div style={{ position: 'absolute', left: 120, top: 80, width: 180, height: 100, border: '1.8px solid #CBD5E1', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 308, top: 80, width: 100, height: 100, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 416, top: 80, width: 140, height: 100, background: '#E2E8F0', borderRadius: 5 }} />

        {/* Row 2 */}
        <div style={{ position: 'absolute', left: 120, top: 188, width: 100, height: 140, background: '#CBD5E1', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 228, top: 188, width: 80, height: 65, border: '1.8px solid #94A3B8', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 228, top: 261, width: 80, height: 67, background: '#94A3B8', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 316, top: 188, width: 120, height: 140, border: '1.2px solid #CBD5E1', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 444, top: 188, width: 112, height: 140, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 5 }} />

        {/* Row 3 */}
        <div style={{ position: 'absolute', left: 120, top: 336, width: 140, height: 90, border: '1.2px solid #CBD5E1', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 268, top: 336, width: 60, height: 90, background: '#0A0F1E', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 336, top: 336, width: 100, height: 90, border: '1.8px solid #94A3B8', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 444, top: 336, width: 112, height: 90, background: '#E2E8F0', borderRadius: 5 }} />

        {/* Row 4 */}
        <div style={{ position: 'absolute', left: 120, top: 434, width: 80, height: 60, background: '#94A3B8', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 208, top: 434, width: 120, height: 60, border: '1.2px solid #CBD5E1', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 336, top: 434, width: 100, height: 60, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 444, top: 434, width: 60, height: 60, border: '1.2px solid #94A3B8', borderRadius: 5 }} />
        <div style={{ position: 'absolute', left: 512, top: 434, width: 44, height: 60, background: '#CBD5E1', borderRadius: 5 }} />

        {/* Scattered accent modules — right side */}
        <div style={{ position: 'absolute', left: 620, top: 130, width: 48, height: 48, background: '#E2E8F0', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 676, top: 130, width: 32, height: 48, border: '1px solid #CBD5E1', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 620, top: 186, width: 88, height: 32, border: '1px solid #E2E8F0', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 780, top: 320, width: 40, height: 40, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 828, top: 320, width: 60, height: 40, border: '1px solid #CBD5E1', borderRadius: 4 }} />

        {/* ===== WORDMARK — RIGHT SIDE ===== */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 340,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: 5,
              color: '#0A0F1E',
              lineHeight: 1,
            }}
          >
            BOXTER
          </div>
          <div
            style={{
              fontSize: 17,
              color: '#94A3B8',
              marginTop: 14,
              letterSpacing: 0.3,
            }}
          >
            전국 패키징 B2B 디렉토리
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
