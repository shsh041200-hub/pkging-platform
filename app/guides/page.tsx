import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_META, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/guide-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/guides`;

export const metadata: Metadata = {
  title: "포장재 가이드 — 업체 선정·소재·공정 완벽 정리",
  description:
    "포장재 구매 담당자를 위한 실무 가이드. 소재 비교, 업체 선정 기준, 발주 절차를 한곳에서 확인하세요.",
  alternates: {
    canonical: canonicalUrl,
    languages: { "ko-KR": canonicalUrl },
  },
  openGraph: {
    title: "포장재 가이드 — Packlinx",
    description:
      "포장재 구매 담당자를 위한 실무 가이드. 소재 비교, 업체 선정 기준, 발주 절차를 한곳에서 확인하세요.",
    url: canonicalUrl,
    siteName: "Packlinx",
    locale: "ko_KR",
    type: "website",
  },
};

export default function GuidesIndexPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    guides: GUIDE_META.filter((g) => g.category === cat),
  }));

  return (
    <main>
      {/* Page header — stays within max-w-3xl of layout */}
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
        포장재 가이드
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-10">
        Packlinx 콘텐츠팀이 포장재 구매 담당자를 위해 작성한 실무 가이드입니다.
        소재 선택, 업체 선정, 발주 절차 등 핵심 기준을 항목별로 확인하세요.
      </p>

      {/* Escape max-w-3xl for the card grid sections */}
      <div className="-mx-5 sm:-mx-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
          {grouped.map(({ cat, guides }) => {
            if (guides.length === 0) return null;
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <div className="flex items-baseline gap-2 mb-5">
                  <h2
                    id={`cat-${cat}`}
                    className="text-[22px] font-bold text-[var(--color-text-primary)]"
                  >
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {guides.length}개
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
                  {guides.map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="flex flex-col h-full border border-[var(--color-border)] rounded-xl p-5 bg-white hover:shadow-md hover:border-[var(--color-brand-200,#bfdbfe)] transition-all duration-150 no-underline group"
                      >
                        <span className="inline-block self-start bg-[var(--color-brand-50,#eff6ff)] text-[var(--color-brand-700,#1d4ed8)] px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-3">
                          {CATEGORY_LABELS[guide.category]}
                        </span>
                        <h3 className="text-[17px] font-semibold leading-snug text-[var(--color-text-primary)] mb-2 flex-1">
                          {guide.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-3 mb-4">
                          {guide.description}
                        </p>
                        <span className="text-sm font-semibold text-[var(--color-brand,#2563eb)] group-hover:underline">
                          → 가이드 보기
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
