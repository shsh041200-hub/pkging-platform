type Props = {
  website: string | null
}

export function CompanyDetailCTA({ website }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-800 text-[13px] underline underline-offset-4 transition-colors"
        >
          웹사이트 방문하기 →
        </a>
      )}
    </div>
  )
}
