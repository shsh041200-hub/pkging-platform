import Link from "next/link";
import type { ReactNode } from "react";

/** TL;DR block — 3 key bullets at the top of a guide */
export function TldrBlock({ bullets }: { bullets: ReactNode[] }) {
  return (
    <div className="my-6 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 not-prose">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-700">
        핵심 요약 (TL;DR)
      </p>
      <ul className="m-0 space-y-2 pl-0 list-none">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-800 leading-6">
            <span className="mt-2 shrink-0 h-1.5 w-1.5 rounded-full bg-orange-500" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type CalloutVariant = "info" | "warn" | "tip";

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  { border: string; bg: string; labelColor: string; icon: string; label: string }
> = {
  info: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    labelColor: "text-blue-700",
    icon: "ℹ",
    label: "정보",
  },
  warn: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    labelColor: "text-amber-700",
    icon: "⚠",
    label: "주의",
  },
  tip: {
    border: "border-green-200",
    bg: "bg-green-50",
    labelColor: "text-green-700",
    icon: "✓",
    label: "팁",
  },
};

/** Callout box — info / warn / tip */
export function CalloutBox({
  variant,
  title,
  children,
}: {
  variant: CalloutVariant;
  title: string;
  children: ReactNode;
}) {
  const cfg = CALLOUT_CONFIG[variant];
  return (
    <div className={`my-4 rounded-lg border ${cfg.border} ${cfg.bg} px-4 py-3 not-prose`}>
      <p className={`mb-1 text-xs font-semibold ${cfg.labelColor}`}>
        {cfg.icon} {cfg.label} — {title}
      </p>
      <p className="m-0 text-sm text-slate-700 leading-6">{children}</p>
    </div>
  );
}

/** Checklist card — pre-order checklist before placing an order */
export function ChecklistCard({
  heading,
  items,
}: {
  heading: string;
  items: ReactNode[];
}) {
  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 not-prose">
      <p className="mb-3 text-sm font-semibold text-slate-700">{heading}</p>
      <ul className="m-0 space-y-2 pl-0 list-none">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-6">
            <span className="mt-0.5 shrink-0 text-slate-400" aria-hidden>
              ☐
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** FAQ section — visible Q&A list */
export function FaqSlot({
  heading = "자주 묻는 질문",
  items,
}: {
  heading?: string;
  items: { q: string; a: ReactNode }[];
}) {
  return (
    <section className="my-8 not-prose">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{heading}</h2>
      <dl className="space-y-3">
        {items.map(({ q, a }, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-slate-200">
            <dt className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">{q}</dt>
            <dd className="m-0 px-4 py-3 text-sm text-slate-700 leading-6">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Sidebar — related guides */
export function SidebarGuides({
  guides,
}: {
  guides: { href: string; label: string; readTime: string }[];
}) {
  return (
    <aside
      className="my-8 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 not-prose"
      aria-label="관련 가이드"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        관련 가이드
      </p>
      <ul className="m-0 space-y-2 pl-0 list-none">
        {guides.map(({ href, label, readTime }) => (
          <li key={href} className="flex items-center justify-between gap-2">
            <Link
              href={href}
              className="text-sm font-medium text-slate-700 hover:text-orange-700 hover:underline"
            >
              {label}
            </Link>
            <span className="shrink-0 text-xs text-slate-400">{readTime}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** End CTA — bottom conversion block */
export function EndCta({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="my-10 rounded-xl bg-orange-700 px-6 py-7 text-center sm:px-8 not-prose">
      <h2 className="mb-2 text-lg font-bold text-white">{title}</h2>
      <p className="mb-5 text-sm text-orange-100">{subtitle}</p>
      <Link
        href={href}
        className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
      >
        무료 비교 →
      </Link>
    </div>
  );
}
