'use client'

import { useState, useEffect } from 'react'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

interface GuideTocDesktopProps {
  items: TocItem[]
}

interface GuideTocMobileProps {
  items: TocItem[]
}

export function GuideTocDesktop({ items }: GuideTocDesktopProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="sticky top-20">
      <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
        목차
      </p>
      <ul className="border-l border-slate-100">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                  setActiveId(item.id)
                }}
                className={[
                  'block py-1.5 text-[13px] transition-all border-l-2 -ml-px',
                  item.level === 3 ? 'pl-6' : 'pl-3',
                  isActive
                    ? 'text-[#C2410C] font-semibold border-l-[#F97316]'
                    : 'text-slate-500 border-l-transparent hover:text-slate-700',
                ].join(' ')}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function GuideTocMobile({ items }: GuideTocMobileProps) {
  const [open, setOpen] = useState(false)

  // Only show H2s on mobile
  const h2Items = items.filter((item) => item.level === 2)

  if (h2Items.length === 0) return null

  return (
    <div className="my-6 bg-slate-50 rounded-lg p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-[14px] font-semibold text-slate-700"
        aria-expanded={open}
      >
        <span>목차 보기</span>
        <span className="text-slate-400 text-[12px]">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <ul className="mt-3 space-y-1">
          {h2Items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="block text-[13px] text-slate-500 py-1 hover:text-slate-700 transition-colors"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
