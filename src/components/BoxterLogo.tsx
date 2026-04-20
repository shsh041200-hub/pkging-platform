import React from 'react';

interface BoxterLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { symbol: 28, fontSize: 14, letterSpacing: 1 },
  md: { symbol: 40, fontSize: 20, letterSpacing: 1.5 },
  lg: { symbol: 56, fontSize: 28, letterSpacing: 2 },
};

export function BoxterLogo({
  variant = 'light',
  size = 'md',
  showWordmark = true,
  className = '',
}: BoxterLogoProps) {
  const { symbol, fontSize, letterSpacing } = sizes[size];
  const isDark = variant === 'dark';

  const symbolFill = isDark ? '#FFFFFF' : '#1B3A5C';
  const symbolFillLight = isDark ? '#E2E8F0' : '#2A5298';
  const symbolFillRight = isDark ? '#CBD5E1' : '#1B3A5C';
  const wordmarkColor = isDark ? '#FFFFFF' : '#1B3A5C';

  const padding = symbol * 0.1;
  const boxW = symbol * 0.9;
  const boxH = symbol * 0.6;
  const boxTop = symbol * 0.38;
  const lidPeak = symbol * 0.18;
  const midX = padding + boxW / 2;
  const tapeY = boxTop + boxH * 0.3;
  const tapeH = boxH * 0.2;

  const totalWidth = showWordmark
    ? symbol + fontSize * 7.2 + 24
    : symbol + padding * 2;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${symbol}`}
      width={totalWidth}
      height={symbol}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BOXTER"
      className={className}
    >
      <title>BOXTER</title>

      {/* Box body */}
      <rect
        x={padding}
        y={boxTop}
        width={boxW}
        height={boxH}
        rx={2}
        fill={symbolFill}
      />

      {/* Lid: left panel */}
      <path
        d={`M${padding} ${boxTop} L${midX} ${lidPeak} L${midX} ${boxTop} Z`}
        fill={symbolFillLight}
      />

      {/* Lid: right panel */}
      <path
        d={`M${padding + boxW} ${boxTop} L${midX} ${lidPeak} L${midX} ${boxTop} Z`}
        fill={symbolFillRight}
        opacity={isDark ? 1 : 0.7}
      />

      {/* Orange fold line on lid */}
      <line
        x1={midX}
        y1={lidPeak}
        x2={midX}
        y2={boxTop}
        stroke="#F97316"
        strokeWidth={Math.max(1.5, symbol * 0.04)}
        strokeLinecap="round"
      />

      {/* Orange tape stripe */}
      <rect
        x={padding}
        y={tapeY}
        width={boxW}
        height={tapeH}
        fill="#F97316"
        opacity={0.95}
      />

      {/* Wordmark */}
      {showWordmark && (
        <>
          <text
            x={symbol + 8}
            y={symbol * 0.68}
            fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
            fontWeight={800}
            fontSize={fontSize}
            letterSpacing={letterSpacing}
            fill={wordmarkColor}
          >
            BOXTER
          </text>
          {/* Orange accent dot */}
          <circle
            cx={totalWidth - 4}
            cy={symbol * 0.3}
            r={Math.max(2, fontSize * 0.18)}
            fill="#F97316"
          />
        </>
      )}
    </svg>
  );
}

/** Standalone favicon symbol only (for <link rel="icon"> use the SVG file directly) */
export function BoxterFavicon({ size = 32 }: { size?: number }) {
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
      <rect width="32" height="32" rx="7" fill="#1B3A5C" />
      <rect x="6" y="14" width="20" height="14" rx="1.5" fill="#FFFFFF" />
      <path d="M6 14 L16 8 L16 14 Z" fill="#E2E8F0" />
      <path d="M26 14 L16 8 L16 14 Z" fill="#CBD5E1" />
      <rect x="6" y="18.5" width="20" height="3.5" fill="#F97316" />
      <line x1="16" y1="8" x2="16" y2="14" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
