interface BusinessRegistrationInfoProps {
  theme?: 'dark' | 'light'
}

const ITEMS = [
  { label: '상호', value: '팩린스' },
  { label: '대표자', value: '김선혁' },
  { label: '사업자등록번호', value: '896-20-02557' },
  { label: '대표 이메일', value: 'privacy@packlinx.com' },
] as const

export function BusinessRegistrationInfo({ theme = 'dark' }: BusinessRegistrationInfoProps) {
  const colorClass = theme === 'dark' ? 'text-slate-500' : 'text-slate-400'

  return (
    <p className={`text-[11px] leading-relaxed ${colorClass}`}>
      {ITEMS.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-1.5 opacity-60">·</span>}
          {item.label}: {item.value}
        </span>
      ))}
    </p>
  )
}
