'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

interface GalleryItem {
  id: string
  url: string
  title: string | null
  description: string | null
  category_tag: string | null
}

interface GalleryLightboxProps {
  items: GalleryItem[]
}

function EmptyGallery() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-[14px] font-medium text-neutral-500">아직 등록된 작업물이 없습니다</p>
      <p className="text-[12px] text-neutral-400 mt-1">이미지 등록 요청 후 업데이트됩니다</p>
    </div>
  )
}

export function GalleryLightbox({ items }: GalleryLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length))
  }, [items.length])

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % items.length))
  }, [items.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, prev, next])

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4">
        <EmptyGallery />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => openLightbox(i)}
            className="relative group overflow-hidden rounded-lg bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stripe-purple"
            style={{ paddingBottom: '100%' }}
            aria-label={item.title ?? `작업물 ${i + 1}`}
          >
            <div className="absolute inset-0">
              {item.url ? (
                <Image
                  src={item.url}
                  alt={item.title ?? `작업물 ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              {item.category_tag && (
                <span className="absolute top-1.5 left-1.5 text-[9px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded">
                  {item.category_tag}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            aria-label="닫기"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="이전"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="다음"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative max-w-3xl w-full max-h-[80vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ maxHeight: '70vh' }}>
              {items[lightboxIndex]?.url ? (
                <div className="relative w-full" style={{ paddingBottom: '66%' }}>
                  <Image
                    src={items[lightboxIndex].url}
                    alt={items[lightboxIndex].title ?? `작업물 ${lightboxIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-neutral-800 rounded-xl flex items-center justify-center">
                  <p className="text-white/40 text-sm">이미지 없음</p>
                </div>
              )}
            </div>

            {(items[lightboxIndex]?.title || items[lightboxIndex]?.description) && (
              <div className="mt-3 text-center px-4">
                {items[lightboxIndex].title && (
                  <p className="text-white font-medium text-[15px]">{items[lightboxIndex].title}</p>
                )}
                {items[lightboxIndex].description && (
                  <p className="text-white/60 text-[13px] mt-1">{items[lightboxIndex].description}</p>
                )}
              </div>
            )}

            <p className="mt-2 text-white/40 text-[12px]">{lightboxIndex + 1} / {items.length}</p>
          </div>
        </div>
      )}
    </>
  )
}
