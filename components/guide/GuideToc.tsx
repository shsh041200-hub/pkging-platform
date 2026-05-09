"use client";

import { useState, useEffect } from "react";

export interface GuideTocItem {
  id: string;
  label: string;
}

interface GuideTocProps {
  items: GuideTocItem[];
}

export function GuideToc({ items }: GuideTocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block sticky top-[120px] self-start text-[13.5px]">
      <h5 className="m-0 mb-3 text-xs tracking-[.06em] text-[var(--g-ink-3)] uppercase font-semibold">
        목차
      </h5>
      <ol className="list-none m-0 p-0 border-l-2 border-[var(--g-line)]">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={[
                "px-[14px] py-[6px] cursor-pointer border-l-2 -ml-[2px] transition-colors",
                isActive
                  ? "text-[var(--g-brand)] border-l-[var(--g-brand)] font-semibold"
                  : "text-[var(--g-ink-3)] border-l-transparent hover:text-[var(--g-ink-2)]",
              ].join(" ")}
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(item.id);
              }}
            >
              {item.label}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
