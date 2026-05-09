"use client";

import Link from "next/link";

export interface RelatedGuide {
  href: string;
  title: string;
  readTime: string;
}

interface GuideSidebarProps {
  ctaHeadline: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaHref: string;
  relatedGuides?: RelatedGuide[];
}

export function GuideSidebar({
  ctaHeadline,
  ctaSubtext,
  ctaButtonLabel,
  ctaHref,
  relatedGuides = [],
}: GuideSidebarProps) {
  function copyLink() {
    navigator.clipboard?.writeText(window.location.href);
  }

  function shareKakao() {
    window.open(
      `https://sharer.kakao.com/talk/friends/picker/link?app_key=weblink&link_url=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
  }

  function shareEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`;
  }

  return (
    <aside className="hidden lg:flex flex-col gap-[18px] sticky top-[120px] self-start text-sm">
      {/* Vendor CTA */}
      <div
        className="rounded-[14px] p-6 text-white"
        style={{ background: "linear-gradient(135deg,#0b1220 0%,#0a3d62 100%)" }}
      >
        <h5 className="m-0 mb-3 text-xs tracking-[.04em] uppercase font-semibold text-white/70">
          지금 견적 받기
        </h5>
        <h3 className="m-0 mb-2 text-[18px] font-semibold tracking-[-0.01em] text-white">
          {ctaHeadline}
        </h3>
        <p className="m-0 mb-4 text-white/80 text-[13.5px] leading-[1.6]">{ctaSubtext}</p>
        <Link
          href={ctaHref}
          className="block text-center bg-white text-[var(--g-brand)] font-bold py-[11px] rounded-[9px] no-underline text-sm hover:bg-gray-50 transition-colors"
        >
          {ctaButtonLabel}
        </Link>
      </div>

      {/* Share */}
      <div className="bg-white border border-[var(--g-line)] rounded-[14px] p-5">
        <h5 className="m-0 mb-3 text-xs tracking-[.04em] text-[var(--g-ink-3)] uppercase font-semibold">
          이 가이드 공유
        </h5>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 bg-[#f3f7fb] border border-[var(--g-line)] text-[var(--g-ink-2)] py-2 rounded-lg text-xs font-medium hover:bg-[#e2e8f0] cursor-pointer"
          >
            🔗 링크
          </button>
          <button
            onClick={shareEmail}
            className="flex-1 bg-[#f3f7fb] border border-[var(--g-line)] text-[var(--g-ink-2)] py-2 rounded-lg text-xs font-medium hover:bg-[#e2e8f0] cursor-pointer"
          >
            📧 메일
          </button>
          <button
            onClick={shareKakao}
            className="flex-1 bg-[#f3f7fb] border border-[var(--g-line)] text-[var(--g-ink-2)] py-2 rounded-lg text-xs font-medium hover:bg-[#e2e8f0] cursor-pointer"
          >
            💬 카톡
          </button>
        </div>
      </div>

      {/* Related guides */}
      {relatedGuides.length > 0 && (
        <div className="bg-white border border-[var(--g-line)] rounded-[14px] p-5">
          <h5 className="m-0 mb-2 text-xs tracking-[.04em] text-[var(--g-ink-3)] uppercase font-semibold">
            관련 가이드
          </h5>
          <ul className="list-none m-0 p-0">
            {relatedGuides.map((g) => (
              <li key={g.href} className="py-[10px] border-b border-[#f1f3f5] last:border-0">
                <Link
                  href={g.href}
                  className="block text-[var(--g-ink)] font-medium text-sm leading-[1.45] no-underline hover:text-[var(--g-brand-2)] transition-colors"
                >
                  {g.title}
                  <span className="block text-[var(--g-ink-3)] text-xs mt-[3px]">
                    ⏱ {g.readTime}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
