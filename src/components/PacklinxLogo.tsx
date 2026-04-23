import React from 'react'

interface PacklinxLogoProps {
  variant?: 'light' | 'dark'
  layout?: 'horizontal' | 'stacked'
  className?: string
}

const FONT_FAMILY = "'Trebuchet MS', Avenir, 'Segoe UI', sans-serif"

const PACK_COLORS = {
  light: '#0F172A',
  dark: '#F8FAFC',
} as const

export function PacklinxLogo({
  variant = 'light',
  layout = 'horizontal',
  className = '',
}: PacklinxLogoProps) {
  const packColor = PACK_COLORS[variant]

  if (layout === 'stacked') {
    return (
      <div
        className={`flex flex-col leading-none select-none ${className}`}
        role="img"
        aria-label="PACKLINX"
      >
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 900,
            fontSize: '1.25rem',
            letterSpacing: '0.12em',
            lineHeight: 1,
            color: packColor,
          }}
        >
          PACK
        </span>
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 200,
            fontSize: '1.25rem',
            letterSpacing: '0.12em',
            lineHeight: 1,
            color: '#F97316',
          }}
        >
          LINX
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-baseline select-none ${className}`}
      role="img"
      aria-label="PACKLINX"
    >
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: '1.25rem',
          letterSpacing: '0.12em',
          lineHeight: 1,
          color: packColor,
        }}
      >
        PACK
      </span>
      <span
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 200,
          fontSize: '1.25rem',
          letterSpacing: '0.12em',
          lineHeight: 1,
          color: '#F97316',
        }}
      >
        LINX
      </span>
    </div>
  )
}
