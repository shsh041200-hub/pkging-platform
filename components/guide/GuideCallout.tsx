import type { ReactNode } from "react";

type Variant = "info" | "tip" | "warn";

const VARIANT_STYLES: Record<Variant, { wrapper: string; icon: string }> = {
  info: {
    wrapper: "bg-[var(--g-brand-soft)] border-[#bfdbfe] text-[#0c2c52]",
    icon: "💡",
  },
  tip: {
    wrapper: "bg-[var(--g-accent-soft)] border-[#a7f3d0] text-[#064e3b]",
    icon: "✅",
  },
  warn: {
    wrapper: "bg-[var(--g-warn-soft)] border-[#fde68a] text-[#78350f]",
    icon: "⚠️",
  },
};

interface GuideCalloutProps {
  variant: Variant;
  title?: string;
  children: ReactNode;
}

export function GuideCallout({ variant, title, children }: GuideCalloutProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div
      className={`my-[22px] rounded-xl px-5 py-[18px] border flex gap-[14px] items-start ${styles.wrapper}`}
    >
      <div className="flex-none w-7 h-7 rounded-full bg-white grid place-items-center text-sm">
        {styles.icon}
      </div>
      <div>
        {title && (
          <b className="block text-[14px] font-semibold mb-1">{title}</b>
        )}
        <div className="text-[15px] leading-[1.65] [&_p]:m-0 [&_p+p]:mt-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
