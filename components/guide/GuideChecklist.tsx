interface GuideChecklistProps {
  title?: string;
  items: string[];
}

export function GuideChecklist({ title, items }: GuideChecklistProps) {
  return (
    <div className="bg-white border border-[var(--g-line)] rounded-[14px] px-6 py-[22px] my-[22px]">
      {title && (
        <h4 className="m-0 mb-3 text-[15px] text-[var(--g-brand)] font-bold">{title}</h4>
      )}
      <ul className="list-none p-0 m-0">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-[10px] items-start py-2 text-[15px] text-[var(--g-ink-2)] border-b border-dashed border-[#eef0f3] last:border-0"
          >
            <span
              aria-hidden
              className="flex-none w-[18px] h-[18px] border-[1.5px] border-[var(--g-brand-2)] rounded-[5px] mt-[3px] bg-white"
            />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
