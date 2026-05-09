import Link from "next/link";
import type { ReactNode } from "react";

interface TldrItem {
  bold: string;
  text: string;
}

interface GuideHeroProps {
  tag: string;
  title: string;
  subtitle?: string;
  author?: string;
  dateLabel?: string;
  readTime?: string;
  views?: string;
  category?: string;
  categoryHref?: string;
  tldr?: TldrItem[];
}

export function GuideHero({
  tag,
  title,
  subtitle,
  author = "Packlinx 콘텐츠팀",
  dateLabel,
  readTime,
  views,
  category,
  categoryHref,
  tldr,
}: GuideHeroProps) {
  return (
    <section
      className="border-b border-[var(--g-line)] bg-white"
      style={{ padding: "48px 0 28px" }}
    >
      <div className="max-w-[1180px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-[var(--g-ink-3)] mb-[14px]" aria-label="breadcrumb">
          <Link href="/" className="text-[var(--g-ink-3)] no-underline hover:underline">홈</Link>
          {" · "}
          <Link href="/guides" className="text-[var(--g-ink-3)] no-underline hover:underline">가이드</Link>
          {category && categoryHref ? (
            <>
              {" · "}
              <Link href={categoryHref} className="text-[var(--g-ink-3)] no-underline hover:underline">
                {category}
              </Link>
            </>
          ) : null}
        </nav>

        {/* Tag pill */}
        <span className="inline-block bg-[var(--g-brand-soft)] text-[var(--g-brand)] text-xs font-semibold px-[10px] py-[5px] rounded-[6px] tracking-[.02em] mb-3">
          {tag}
        </span>

        {/* Title */}
        <h1 className="text-[38px] leading-[1.25] tracking-[-0.02em] m-0 mb-[14px] font-extrabold text-[var(--g-ink)]">
          {title}
          {subtitle && (
            <small className="block text-lg font-medium text-[var(--g-ink-3)] mt-2 tracking-normal">
              {subtitle}
            </small>
          )}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap gap-[18px] text-[13.5px] text-[var(--g-ink-3)]">
          <span className="inline-flex items-center gap-2 text-[var(--g-ink-2)] font-medium">
            <span
              aria-hidden
              className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#0a3d62 0%,#1e6fb8 100%)" }}
            >
              PL
            </span>
            {author}
          </span>
          {dateLabel && <span>📅 {dateLabel}</span>}
          {readTime && <span>⏱ {readTime}</span>}
          {views && <span>👁 {views}</span>}
        </div>

        {/* TL;DR */}
        {tldr && tldr.length > 0 && (
          <div
            className="mt-6 border border-[var(--g-line)] rounded-2xl px-6 py-[22px]"
            style={{ background: "linear-gradient(180deg,#f3f7fb 0%,#fff 100%)" }}
          >
            <h4 className="m-0 mb-[10px] text-[13px] text-[var(--g-brand)] tracking-[.04em] uppercase font-semibold">
              3줄 요약 (TL;DR)
            </h4>
            <ul className="m-0 pl-5 text-[var(--g-ink-2)] leading-[1.75]">
              {tldr.map((item, i) => (
                <li key={i} className="my-1">
                  <b className="text-[var(--g-ink)]">{item.bold}</b> {item.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export type { GuideHeroProps, TldrItem };
