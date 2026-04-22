import React from 'react';

interface BoxterLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const symbolSizes = { sm: 28, md: 40, lg: 56 };
const fontSizes = { sm: 14, md: 20, lg: 28 };
const letterSpacings = { sm: 1, md: 1.5, lg: 2 };

export function BoxterLogo({
  variant = 'light',
  size = 'md',
  showWordmark = true,
  className = '',
}: BoxterLogoProps) {
  const s = symbolSizes[size];
  const scale = s / 32;
  const isDark = variant === 'dark';
  const fontSize = fontSizes[size];
  const letterSpacing = letterSpacings[size];
  const wordmarkColor = isDark ? '#FFFFFF' : '#0A0F1E';
  const gap = 8;
  const totalWidth = showWordmark ? s + gap + fontSize * 6.8 : s;

  // Concept #10 — Modular Grid coordinates (based on 32×32 favicon)
  const r = (v: number) => v * scale;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${s}`}
      width={totalWidth}
      height={s}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BOXTER"
      className={className}
    >
      <title>BOXTER</title>

      {/* Icon background */}
      <rect width={s} height={s} rx={r(7)} fill="#F1F5F9" />
      <rect x={0.5 * scale} y={0.5 * scale} width={s - scale} height={s - scale} rx={r(6.5)} fill="none" stroke="#E2E8F0" strokeWidth={scale} />

      {/* Row 1 — outline cell */}
      <rect x={r(6)} y={r(6)} width={r(11)} height={r(8)} rx={r(1)} fill="none" stroke="#94A3B8" strokeWidth={r(1.2)} />
      {/* Row 1 — filled cell */}
      <rect x={r(19)} y={r(6)} width={r(7)} height={r(8)} rx={r(1)} fill="#CBD5E1" />

      {/* Row 2 — filled cell */}
      <rect x={r(6)} y={r(16)} width={r(7)} height={r(10)} rx={r(1)} fill="#94A3B8" />
      {/* Row 2 — outline cell */}
      <rect x={r(15)} y={r(16)} width={r(5)} height={r(10)} rx={r(1)} fill="none" stroke="#94A3B8" strokeWidth={r(1.2)} />
      {/* Row 2 — dark accent cell */}
      <rect x={r(22)} y={r(16)} width={r(4)} height={r(10)} rx={r(1)} fill="#0A0F1E" />

      {/* Wordmark */}
      {showWordmark && (
        <text
          x={s + gap}
          y={s * 0.7}
          fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
          fontWeight={800}
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          fill={wordmarkColor}
        >
          BOXTER
        </text>
      )}
    </svg>
  );
}

/** Standalone favicon symbol only (for <link rel="icon"> use the SVG file directly) */
export function BoxterFavicon({ size = 32 }: { size?: number }) {
  const scale = size / 32;
  const r = (v: number) => v * scale;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BOXTER"
    >
      <rect width="32" height="32" rx="7" fill="#F1F5F9" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="6" y="6" width="11" height="8" rx="1" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="19" y="6" width="7" height="8" rx="1" fill="#CBD5E1" />
      <rect x="6" y="16" width="7" height="10" rx="1" fill="#94A3B8" />
      <rect x="15" y="16" width="5" height="10" rx="1" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
      <rect x="22" y="16" width="4" height="10" rx="1" fill="#0A0F1E" />
    </svg>
  );
}
