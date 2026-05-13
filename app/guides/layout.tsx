import Link from "next/link";
import type React from "react";
import { PacklinxLogo } from "@/components/PacklinxLogo";
import { SiteHeader } from "@/components/SiteHeader";

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
      <SiteHeader />

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
