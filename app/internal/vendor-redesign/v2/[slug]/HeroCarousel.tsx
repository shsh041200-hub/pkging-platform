'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'

interface HeroCarouselProps {
  images: Array<{ url: string; title: string | null; alt: string }>
  vendorName: string
}

function PlaceholderSlide({ vendorName }: { vendorName: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 select-none">
      <svg className="w-16 h-16 text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-[13px] font-medium text-neutral-400">이미지 미등록</p>
      <p className="text-[11px] text-neutral-300 mt-1">{vendorName}</p>
    </div>
  )
}

export function HeroCarousel({ images, vendorName }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const hasImages = images.length > 0

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  return (
    <div className="relative w-full" style={{ paddingBottom: '52%' }}>
      <div className="absolute inset-0 bg-neutral-100 overflow-hidden">
        {!hasImages ? (
          <PlaceholderSlide vendorName={vendorName} />
        ) : (
          <>
            {images.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={i !== current}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  priority={i === 0}
                />
              </div>
            ))}

            {/* Caption overlay */}
            {images[current]?.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 sm:px-6 pb-4 pt-12">
                <p className="text-[13px] font-medium text-white/90">{images[current].title}</p>
              </div>
            )}

            {/* Navigation arrows — only when > 1 image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="이전 이미지"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  aria-label="다음 이미지"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      aria-label={`이미지 ${i + 1}`}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
