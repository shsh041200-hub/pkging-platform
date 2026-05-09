type PillVariant = "default" | "warn" | "good";

export interface CompareTableColumn {
  label: string;
  key: string;
}

export interface CompareTableRow {
  [key: string]: string | { text: string; pill?: PillVariant };
}

interface GuideCompareTableProps {
  columns: CompareTableColumn[];
  rows: CompareTableRow[];
}

function PillCell({ value }: { value: string | { text: string; pill?: PillVariant } }) {
  if (typeof value === "string") {
    return <span dangerouslySetInnerHTML={{ __html: value }} />;
  }
  const pillClass =
    value.pill === "warn"
      ? "bg-[var(--g-warn-soft)] text-[#92400e]"
      : value.pill === "good"
        ? "bg-[var(--g-accent-soft)] text-[#065f46]"
        : "bg-[#eef4fb] text-[var(--g-brand-2)]";
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-[3px] rounded-full ${pillClass}`}
    >
      {value.text}
    </span>
  );
}

export function GuideCompareTable({ columns, rows }: GuideCompareTableProps) {
  return (
    <div className="overflow-auto my-[18px] mb-6 border border-[var(--g-line)] rounded-xl bg-white">
      <table className="w-full border-collapse text-sm min-w-[680px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="bg-[#f3f7fb] text-[var(--g-ink)] font-bold text-left px-4 py-[14px] border-b border-[var(--g-line)] sticky top-0"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-[#fafbfc] group">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-[14px] border-b border-[#f1f3f5] text-[var(--g-ink-2)] align-top leading-[1.55] last-of-type:border-0 group-last:border-0"
                >
                  <PillCell value={row[col.key] ?? ""} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
