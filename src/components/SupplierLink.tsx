import Link from 'next/link'
import type { ReactNode } from 'react'

interface SupplierLinkProps {
  slug: string
  name: string
  children?: ReactNode
}

export function SupplierLink({ slug, name, children }: SupplierLinkProps) {
  return (
    <Link
      href={`/companies/${slug}`}
      className="text-[#2563EB] hover:underline underline-offset-2 font-medium transition-colors"
    >
      {children ?? name}
    </Link>
  )
}
