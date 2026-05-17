import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.packlinx.com"
).replace(/\/$/, "");
const canonicalUrl = `${siteUrl}/blog`;

const TITLE =
  "Packlinx 블로그 — 포장재 구매 담당자를 위한 실무 인사이트";
const DESCRIPTION =
  "패키징 조달·트렌드·RFQ 전략. Packlinx 편집팀이 현장 데이터를 기반으로 작성하는 구매 담당자 전용 가이드.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: canonicalUrl,
    languages: { "ko-KR": canonicalUrl },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: canonicalUrl,
    siteName: "Packlinx",
    locale: "ko_KR",
    type: "website",
  },
};

const BLOG_POSTS = [
  {
    slug: "packaging-rfq-guide",
    title:
      "포장 업체 견적 요청 완전 가이드 — RFQ 준비부터 업체 선정까지 (2026)",
    description:
      "포장재 견적 요청(RFQ) 전 꼭 알아야 할 7가지 — 수량·소재·납기 정보 준비법부터 복수 업체 비교 선정 기준까지",
    date: "2026-05-08",
    category: "조달 가이드",
    readTime: "8분",
  },
  {
    slug: "2026-korea-packaging-trends",
    title:
      "2026 한국 패키징 트렌드: 구매 담당자가 알아야 할 7가지 변화",
    description:
      "EPR 규제 강화·친환경 전환·스마트 패키징·이커머스 포장 변화·원자재 가격 대응 전략을 구매 담당자 시각에서 정리합니다.",
    date: "2026-05-07",
    category: "산업 리포트",
    readTime: "10분",
  },
] as const;

const blogListJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: TITLE,
  description: DESCRIPTION,
  url: canonicalUrl,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: "Packlinx",
    url: siteUrl,
  },
  blogPost: BLOG_POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${siteUrl}/blog/${post.slug}`,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Packlinx 편집팀",
      url: siteUrl,
    },
  })),
};

const brand = "var(--color-brand-500)";
const brandSoft = "var(--color-brand-50)";
const brandBorder = "var(--color-brand-200)";

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Packlinx", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "블로그", item: canonicalUrl },
  ],
};

export default function BlogIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <div className="-mx-5 sm:-mx-8 -mt-10 sm:-mt-14">
        {/* Hero */}
        <section
          className="border-b border-[var(--g-line)]"
          style={{
            padding: "64px 0 36px",
            background: "linear-gradient(180deg,#f3f7fb 0%,#fafbfc 100%)",
          }}
        >
          <div className="max-w-[1180px] mx-auto px-6">
            <nav className="text-[13px] text-[var(--g-ink-3)] mb-[14px]">
              <Link
                href="/"
                className="text-[var(--g-ink-3)] no-underline hover:underline"
              >
                홈
              </Link>
              {" · "}
              <b className="text-[var(--g-ink-2)] font-medium">블로그</b>
            </nav>
            <h1 className="text-[44px] leading-[1.18] tracking-[-0.025em] m-0 mb-3 font-extrabold text-[var(--g-ink)]">
              포장재 구매 담당자를 위한
              <br className="hidden sm:block" />
              실무 인사이트
            </h1>
            <p className="text-lg leading-[1.6] text-[var(--g-ink-2)] max-w-[720px] m-0 mb-6">
              패키징 조달·트렌드·RFQ 전략. Packlinx 편집팀이 현장 데이터를
              기반으로 작성하는 구매 담당자 전용 가이드.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-[10px] no-underline hover:opacity-90 transition-opacity"
                style={{ background: brand }}
              >
                업체 찾기 →
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-[10px] no-underline hover:opacity-90 transition-opacity border"
                style={{
                  color: brand,
                  borderColor: brandBorder,
                  background: brandSoft,
                }}
              >
                가이드 보기
              </Link>
            </div>
          </div>
        </section>

        {/* Post list */}
        <main className="max-w-[1180px] mx-auto px-6 pb-16 mt-12">
          <h2 className="text-[22px] tracking-[-0.02em] m-0 mb-6 font-extrabold text-[var(--g-ink)]">
            최신 포스트
          </h2>
          <div className="flex flex-col gap-[18px]">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-[var(--g-line)] rounded-[14px] p-[24px] flex flex-col sm:flex-row sm:items-center gap-4 no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--g-shadow)]"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-[10px] py-1 rounded-full"
                      style={{ background: brandSoft, color: brand }}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--g-ink-3)]">
                      {post.date}
                    </span>
                    <span className="text-xs text-[var(--g-ink-3)]">
                      ⏱ {post.readTime}
                    </span>
                  </div>
                  <h3 className="m-0 mb-2 text-[20px] leading-[1.35] tracking-[-0.015em] text-[var(--g-ink)] font-bold">
                    {post.title}
                  </h3>
                  <p className="m-0 text-[var(--g-ink-3)] text-[14px] leading-[1.6]">
                    {post.description}
                  </p>
                </div>
                <div
                  className="flex-none text-sm font-semibold group-hover:underline whitespace-nowrap"
                  style={{ color: brand }}
                >
                  읽기 →
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Bottom CTA */}
        <div className="max-w-[1180px] mx-auto px-6">
          <div
            className="mb-20 text-white rounded-[20px] px-10 py-10 flex items-center justify-between gap-6 flex-wrap"
            style={{
              background: "linear-gradient(135deg,#1c1e54 0%,#533afd 100%)",
            }}
          >
            <div>
              <h3 className="m-0 mb-1.5 text-2xl tracking-[-0.015em] font-bold">
                읽고 나서 바로 업체를 찾으세요.
              </h3>
              <p className="m-0 text-white/80 text-[15px]">
                1,380개 등록 업체에서 조건에 맞는 곳을 무료로 비교하세요.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-white font-bold px-[22px] py-[14px] rounded-xl text-[15px] no-underline hover:opacity-90 transition-opacity"
              style={{
                background: "rgba(255,255,255,.15)",
                border: "1px solid rgba(255,255,255,.3)",
              }}
            >
              업체 찾기 →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
