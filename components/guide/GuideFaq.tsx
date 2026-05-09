export interface FaqItem {
  question: string;
  answer: string;
}

interface GuideFaqProps {
  items: FaqItem[];
}

export function GuideFaq({ items }: GuideFaqProps) {
  return (
    <div className="my-[22px]">
      {items.map((item, i) => (
        <details
          key={i}
          open={i === 0}
          className="bg-white border border-[var(--g-line)] rounded-xl mb-[10px] transition-[border-color] open:border-[var(--g-brand-2)] open:[box-shadow:var(--g-shadow)] group"
        >
          <summary className="cursor-pointer list-none px-[22px] py-[18px] text-base font-semibold text-[var(--g-ink)] flex justify-between items-center gap-[14px] select-none">
            <span>{item.question}</span>
            <span className="text-[22px] text-[var(--g-ink-3)] font-normal transition-transform group-open:rotate-45 group-open:text-[var(--g-brand-2)] flex-none">
              +
            </span>
          </summary>
          <div
            className="px-[22px] pb-5 text-[var(--g-ink-2)] text-[15px] leading-[1.7] [&_a]:text-[var(--g-brand-2)] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        </details>
      ))}
    </div>
  );
}
