import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'

export function SiteHeader() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-border-v04">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <PacklinxLogo variant="light" />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-500">
          <Link href="/" className="hover:text-heading-deep-navy transition-colors">
            전체 업체 보기
          </Link>
          <Link href="/categories" className="hover:text-heading-deep-navy transition-colors">
            카테고리
          </Link>
          <Link href="/guides" className="hover:text-heading-deep-navy transition-colors">
            가이드
          </Link>
        </nav>
      </div>
    </header>
  )
}
