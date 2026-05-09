import Link from "next/link";
import type { ReactNode } from "react";

export function GuidePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="prose-guide max-w-3xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
      <nav
        aria-label="breadcrumb"
        className="mb-6 text-sm text-gray-500 [&_a]:!text-gray-500 [&_a]:!no-underline hover:[&_a]:!text-[#C2410C]"
      >
        <Link href="/">홈</Link>
        <span className="mx-2 text-gray-300">/</span>
        <Link href="/guides">가이드</Link>
      </nav>
      {children}
    </div>
  );
}
