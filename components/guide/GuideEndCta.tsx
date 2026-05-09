import Link from "next/link";

interface GuideEndCtaProps {
  headline: string;
  subtext: string;
  buttonLabel: string;
  href: string;
}

export function GuideEndCta({ headline, subtext, buttonLabel, href }: GuideEndCtaProps) {
  return (
    <div className="mt-10 bg-[var(--g-brand-soft)] border border-[#bfdbfe] rounded-2xl px-7 py-7 flex justify-between items-center gap-4 flex-wrap">
      <div>
        <h3 className="m-0 mb-1 text-xl text-[var(--g-ink)] font-bold">{headline}</h3>
        <p className="m-0 text-[var(--g-ink-2)] text-sm">{subtext}</p>
      </div>
      <Link
        href={href}
        className="bg-[var(--g-brand)] text-white px-5 py-3 rounded-[10px] font-semibold text-sm no-underline hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
