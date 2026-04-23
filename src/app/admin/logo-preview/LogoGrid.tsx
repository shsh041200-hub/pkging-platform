'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LOGO_CONCEPTS, type LogoConcept } from './logoData';

const UI_TEXT = {
  darkToggle: '다크 배경',
  lightToggle: '라이트 배경',
  colorsLabel: '컬러 팔레트',
  headerMockLabel: '헤더 네비게이션 미리보기',
  faviconLabel: '파비콘 (32×32)',
  mobileLabel: '모바일 (200px)',
  siteName: 'packlinx',
  navLinks: ['공급업체', '카테고리', '견적 문의'],
  placeholderAlt: '로고 시안',
} as const;

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded-sm border border-black/10 flex-shrink-0"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-400 font-mono ml-auto">{hex}</span>
    </div>
  );
}

function HeaderMock({ src, alt, dark }: { src: string; alt: string; dark: boolean }) {
  return (
    <div
      className={`rounded-md overflow-hidden border ${dark ? 'border-white/10' : 'border-gray-200'}`}
      style={{ backgroundColor: dark ? '#0A0F1E' : '#FFFFFF' }}
    >
      <div className="flex items-center justify-between px-4 h-10">
        <div className="relative h-5 w-28">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="112px"
            className="object-contain object-left"
            unoptimized
          />
        </div>
        <nav className="flex gap-4">
          {UI_TEXT.navLinks.map((link) => (
            <span
              key={link}
              className="text-xs"
              style={{ color: dark ? '#9CA3AF' : '#374151' }}
            >
              {link}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileMock({ src, alt, dark }: { src: string; alt: string; dark: boolean }) {
  return (
    <div
      className="w-[200px] rounded-md overflow-hidden border"
      style={{
        borderColor: dark ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
        backgroundColor: dark ? '#0A0F1E' : '#FFFFFF',
      }}
    >
      <div className="flex items-center justify-between px-3 h-10">
        <div className="relative h-4 w-24">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="96px"
            className="object-contain object-left"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className="block w-4 h-0.5 rounded"
            style={{ backgroundColor: dark ? '#9CA3AF' : '#374151' }}
          />
          <span
            className="block w-4 h-0.5 rounded"
            style={{ backgroundColor: dark ? '#9CA3AF' : '#374151' }}
          />
          <span
            className="block w-4 h-0.5 rounded"
            style={{ backgroundColor: dark ? '#9CA3AF' : '#374151' }}
          />
        </div>
      </div>
    </div>
  );
}

function LogoCard({ concept }: { concept: LogoConcept }) {
  const [dark, setDark] = useState(false);

  const bg = dark ? '#0A0F1E' : '#FFFFFF';
  const cardBorder = dark ? 'border-white/10' : 'border-gray-200';

  return (
    <article className={`rounded-xl border ${cardBorder} overflow-hidden flex flex-col`}>
      {/* Version badge + toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">
          {concept.version}
        </span>
        <button
          onClick={() => setDark((d) => !d)}
          className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {dark ? UI_TEXT.lightToggle : UI_TEXT.darkToggle}
        </button>
      </div>

      {/* Main logo display */}
      <div
        className="flex items-center justify-center px-8 py-8 min-h-[120px] transition-colors duration-300"
        style={{ backgroundColor: bg }}
      >
        <div className="relative w-full max-w-[240px] h-[68px]">
          <Image
            src={concept.lightSrc}
            alt={`${concept.name} ${UI_TEXT.placeholderAlt}`}
            fill
            sizes="240px"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      {/* Info section */}
      <div className="px-4 py-4 flex flex-col gap-4 flex-1 bg-white">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{concept.name}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{concept.concept}</p>
        </div>

        {/* Color palette */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            {UI_TEXT.colorsLabel}
          </p>
          <div className="flex flex-col gap-1.5">
            {concept.palette.map((color) => (
              <ColorSwatch key={color.hex} hex={color.hex} label={color.label} />
            ))}
          </div>
        </div>

        {/* Context previews */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              {UI_TEXT.headerMockLabel}
            </p>
            <HeaderMock src={concept.lightSrc} alt={concept.name} dark={dark} />
          </div>

          <div className="flex gap-4 items-start">
            {/* Favicon */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                {UI_TEXT.faviconLabel}
              </p>
              <div
                className="w-8 h-8 rounded-sm border border-gray-200 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: dark ? '#0A0F1E' : '#FFFFFF' }}
              >
                <div className="relative w-7 h-7">
                  <Image
                    src={concept.lightSrc}
                    alt={concept.name}
                    fill
                    sizes="28px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                {UI_TEXT.mobileLabel}
              </p>
              <MobileMock src={concept.lightSrc} alt={concept.name} dark={dark} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LogoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {LOGO_CONCEPTS.map((concept) => (
        <LogoCard key={concept.version} concept={concept} />
      ))}
    </div>
  );
}
