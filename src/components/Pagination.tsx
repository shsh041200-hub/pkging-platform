import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  buildPageUrl: (page: number) => string
}

export function Pagination({ currentPage, totalPages, buildPageUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <nav aria-label="페이지 탐색" className="flex items-center justify-center gap-1 mt-8 mb-12">
      <Link
        href={buildPageUrl(currentPage - 1)}
        aria-label="이전 페이지"
        aria-disabled={currentPage === 1}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-[13px] text-gray-400 transition-colors ${
          currentPage === 1
            ? 'opacity-40 pointer-events-none'
            : 'hover:bg-gray-100'
        }`}
      >
        ‹
      </Link>

      {pages.map((page, i) =>
        page === null ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-[13px] text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(page)}
            aria-label={`${page}페이지`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-medium transition-colors ${
              page === currentPage
                ? 'bg-[#005EFF] text-white font-semibold'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={buildPageUrl(currentPage + 1)}
        aria-label="다음 페이지"
        aria-disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-[13px] text-gray-400 transition-colors ${
          currentPage === totalPages
            ? 'opacity-40 pointer-events-none'
            : 'hover:bg-gray-100'
        }`}
      >
        ›
      </Link>
    </nav>
  )
}

function buildPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = []

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push(null)
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push(null)
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push(null)
    pages.push(current - 1)
    pages.push(current)
    pages.push(current + 1)
    pages.push(null)
    pages.push(total)
  }

  return pages
}
