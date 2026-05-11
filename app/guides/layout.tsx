import Link from "next/link";
import type React from "react";
import { PacklinxLogo } from "@/components/PacklinxLogo";

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      style={
        {
          "--g-brand": "var(--color-brand-500)",
          "--g-brand-2": "var(--color-brand-400)",
          "--g-brand-soft": "var(--color-brand-50)",
        } as React.CSSProperties
      }
    >
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">
              패키징 업체 검색 플랫폼
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/categories"
              className="text-slate-200 hover:text-white text-sm font-medium px-3 sm:px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors"
            >
              카테고리
            </Link>
            <Link
              href="/guides"
              className="text-white text-sm font-semibold px-3 sm:px-3.5 py-2 border border-white/[0.30] bg-white/[0.06] rounded-full transition-colors"
            >
              가이드
            </Link>
            <Link
              href="/"
              className="text-slate-200 hover:text-white text-sm font-medium px-3 sm:px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors"
            >
              업체 검색
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 w-full overflow-x-clip">
        {children}
      </div>

      <footer className="border-t border-gray-200 bg-[#F8FAFC] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center text-sm text-gray-500 space-x-3">
          <Link href="/" className="hover:text-[#C2410C] font-semibold">Packlinx</Link>
          <span className="text-gray-300">·</span>
          <Link href="/guides" className="hover:text-[#C2410C]">가이드</Link>
          <span className="text-gray-300">·</span>
          <Link href="/categories" className="hover:text-[#C2410C]">카테고리</Link>
          <span className="text-gray-300">·</span>
          <Link href="/privacy" className="hover:text-[#C2410C]">개인정보처리방침</Link>
          <span className="text-gray-300">·</span>
          <Link href="/terms" className="hover:text-[#C2410C]">이용약관</Link>
        </div>
      </footer>
    </div>
  );
}
