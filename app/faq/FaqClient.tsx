'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

const T = {
  brand:     '#533AFD',
  brandSoft: '#F0EEFF',
  ink:       '#0F172A',
  ink2:      '#334155',
  ink3:      '#64748B',
  line:      '#E2E8F0',
  bg:        '#F8FAFC',
  white:     '#FFFFFF',
  amber:     '#FEF3C7',
  amberLine: '#F59E0B',
}

interface FaqItem {
  id: string
  question: string
  category: string
  answer: React.ReactNode
  relatedGuides?: { href: string; label: string }[]
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-jeongbo-deungrok',
    category: '서비스·정보 등록',
    question: '「정보 등록」 표시는 무엇인가요?',
    relatedGuides: [
      { href: '/guides/corrugated-box-supplier-selection', label: '골판지 박스 업체 선정 가이드' },
      { href: '/guides/eco-friendly-packaging', label: '친환경 패키징 인증·비용 가이드' },
    ],
    answer: (
      <div className="space-y-4">
        {/* §0 한정 문구 — 필수, 변경 금지 (PACAA-509 LC §0) */}
        <div
          className="rounded-r-lg px-4 py-3 text-sm leading-relaxed"
          style={{ background: T.amber, borderLeft: `4px solid ${T.amberLine}`, color: T.ink2 }}
        >
          <strong>한정 문구:</strong> 본 표시(
          <code className="px-1 rounded text-xs font-mono" style={{ background: '#FDE68A' }}>정보 등록</code>
          )는 외부 공인 인증기관(예: KS, ISO, Korean Standards Association, 한국정보통신기술협회 등)이 발급한 인증이
          아닙니다. Packlinx 가 자체적으로 운영하는 등록 절차에 따라, 객관적·실증 가능한 기준을 만족한 업체에 한해 부여되는
          표시입니다.
        </div>

        <p className="text-sm leading-relaxed" style={{ color: T.ink2 }}>
          「정보 등록」은 Packlinx 가 자체적으로 수립한 등록 절차를 통해, 아래의 객관적·실증 가능한 기준을 모두 충족한
          업체에 부여하는 표시입니다. 외부 공공기관이나 국가 인증기관의 인증과는 무관합니다.
        </p>

        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: T.ink }}>§1 — 부여 기준 (5가지 모두 충족 필요)</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-sm ml-1" style={{ color: T.ink2 }}>
            <li>사업자등록번호(BRN) 유효성 — 국세청 조회에서 &quot;계속사업자&quot; 상태 확인</li>
            <li>법인·사업자 명의 일치 — 국세청 조회 결과의 상호와 등록 상호가 일치</li>
            <li>웹사이트 도메인 실재성 — HTTP 정상 응답 + 도메인 소유자가 사업자와 동일 주체로 추정 가능</li>
            <li>통신판매업 신고 여부 — 공정거래위원회 통신판매사업자 조회 결과 존재 (미해당 업체는 면제 사유 기록)</li>
            <li>최소 1회 양방향 연락 가능성 확인 — 대표 이메일 또는 전화로 응답 확인</li>
          </ol>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: T.ink }}>§2 — 갱신 주기</h4>
          <p className="text-sm leading-relaxed" style={{ color: T.ink2 }}>
            12개월(연 1회) 정기 갱신. 업체 상호·사업자번호·도메인 변경, 또는 이용자 신고가 3건 이상 누적되면
            즉시 재검증을 실시합니다.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: T.ink }}>§3 — 표시 박탈 사유</h4>
          <p className="text-sm leading-relaxed mb-1" style={{ color: T.ink2 }}>
            다음 중 하나라도 해당하면 표시가 즉시 철회됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm ml-1" style={{ color: T.ink2 }}>
            <li>사업자등록 상태가 휴업·폐업·말소로 전환된 경우</li>
            <li>도메인 미응답이 14일 이상 지속된 경우</li>
            <li>최근 90일 내 양방향 연락 확인 실패</li>
            <li>통신판매업 신고가 직권 말소된 경우</li>
            <li>업체 본인의 박탈 요청</li>
            <li>사실 조사 결과 부여 기준이 충족되지 않음이 확인된 경우</li>
            <li>표시광고법·전자상거래법 위반으로 공정거래위원회 처분을 받은 사실이 공시된 경우</li>
          </ul>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: T.ink3 }}>
          상세 기준 전문은{' '}
          <Link href="/terms#appendix-vendor-registration" className="underline hover:opacity-80">
            이용약관 별표 — Vendor 정보 등록 기준
          </Link>
          을 참고하세요.
        </p>
      </div>
    ),
  },
  {
    id: 'service-free',
    category: '서비스·정보 등록',
    question: 'Packlinx 는 무료인가요?',
    answer: (
      <p className="text-sm leading-relaxed" style={{ color: T.ink2 }}>
        네, Packlinx 의 업체 검색·열람 기능은 모두 무료입니다. 회원 가입 없이 이용하실 수 있습니다.
      </p>
    ),
  },
  {
    id: 'how-company-info-collected',
    category: '업체 정보 관리',
    question: '업체 정보는 어떻게 수집되나요?',
    relatedGuides: [
      { href: '/guides/packaging-material-complete-guide', label: '패키징 소재 종합 가이드' },
    ],
    answer: (
      <p className="text-sm leading-relaxed" style={{ color: T.ink2 }}>
        Packlinx 는 인터넷에 공개된 사업자 정보(업체명, 웹사이트 URL, 카테고리, 취급 제품, 인증 정보, 사업 설명 등)를
        자동으로 수집·가공하여 게재합니다. 전화번호·주소·이메일 등 개인식별 연락처는 수집하지 않습니다.
        정보의 정확성·최신성·완전성은 보증되지 않으며, 오류가 있는 경우 아래의 정보 수정·삭제 요청을 통해 알려주세요.
      </p>
    ),
  },
  {
    id: 'request-correction-or-removal',
    category: '업체 정보 관리',
    question: '업체 정보 수정·삭제를 요청하려면 어떻게 하나요?',
    answer: (
      <div className="space-y-2 text-sm" style={{ color: T.ink2 }}>
        <p className="leading-relaxed">
          아래 방법으로 요청하실 수 있으며, 영업일 기준 24시간 이내에 처리 결과를 안내해 드립니다.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>
            온라인 신청:{' '}
            <Link href="/opt-out" className="underline hover:opacity-80">
              packlinx.com/opt-out
            </Link>
          </li>
          <li>
            이메일:{' '}
            <a href="mailto:rpdla041200@gmail.com" className="underline hover:opacity-80">
              rpdla041200@gmail.com
            </a>
          </li>
        </ul>
      </div>
    ),
  },
]

const CATEGORIES = ['서비스·정보 등록', '업체 정보 관리'] as const

function AnchorButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [id])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${id} 링크 복사`}
      title="링크 복사"
      className="flex-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded"
      style={{ color: copied ? T.brand : T.ink3 }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (window.location.hash === `#${item.id}`) {
      setOpen(true)
      setTimeout(() => {
        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [item.id])

  return (
    <div
      id={item.id}
      className="bg-white rounded-2xl overflow-hidden group"
      style={{
        border: open ? `1.5px solid ${T.brand}` : `1.5px solid ${T.line}`,
        boxShadow: open ? `0 0 0 3px ${T.brandSoft}` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        scrollMarginTop: '80px',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer select-none hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[15px] font-semibold pr-2 leading-snug" style={{ color: T.ink }}>
            {item.question}
          </span>
          <AnchorButton id={item.id} />
        </div>
        <svg
          className="flex-none transition-transform duration-200"
          style={{
            width: 16, height: 16,
            color: T.ink3,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1" style={{ borderTop: `1px solid ${T.line}` }}>
          {item.answer}

          {item.relatedGuides && item.relatedGuides.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${T.line}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: T.ink3 }}>관련 가이드</p>
              <div className="flex flex-wrap gap-2">
                {item.relatedGuides.map((g) => (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full no-underline hover:opacity-90 transition-opacity"
                    style={{ background: T.brandSoft, color: T.brand }}
                  >
                    <span aria-hidden>📖</span>
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FaqClient() {
  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <header style={{ background: T.ink }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PacklinxLogo variant="dark" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/guides"
              className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              가이드
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              카테고리
            </Link>
          </nav>
        </div>
      </header>

      <section style={{ borderBottom: `1px solid ${T.line}`, background: 'linear-gradient(180deg,#f3f7fb 0%,#fafbfc 100%)' }} className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="text-xs mb-3" style={{ color: T.ink3 }}>
            <Link href="/" className="hover:underline" style={{ color: T.ink3 }}>홈</Link>
            {' · '}
            <span style={{ color: T.ink2 }} className="font-medium">자주 묻는 질문</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight tracking-tight" style={{ color: T.ink }}>
            자주 묻는 질문
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: T.ink3 }}>
            Packlinx 서비스 이용에 관한 자주 묻는 질문을 안내합니다.
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`#cat-${encodeURIComponent(cat)}`}
                className="inline-flex items-center text-xs font-medium px-3.5 py-1.5 rounded-full no-underline transition-all"
                style={{
                  background: T.white,
                  border: `1.5px solid ${T.line}`,
                  color: T.ink2,
                }}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-16">
        {CATEGORIES.map((cat) => {
          const items = FAQ_ITEMS.filter((i) => i.category === cat)
          return (
            <section
              key={cat}
              id={`cat-${encodeURIComponent(cat)}`}
              className="mb-10"
              aria-labelledby={`cat-heading-${cat}`}
              style={{ scrollMarginTop: '72px' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2
                  id={`cat-heading-${cat}`}
                  className="text-base font-bold tracking-tight"
                  style={{ color: T.ink }}
                >
                  {cat}
                </h2>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: T.brandSoft, color: T.brand }}
                >
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <FaqAccordion key={item.id} item={item} />
                ))}
              </div>
            </section>
          )
        })}

        <div
          className="mt-2 rounded-2xl px-5 py-5"
          style={{ background: T.white, border: `1.5px solid ${T.line}` }}
        >
          <h2 className="text-[15px] font-semibold mb-1" style={{ color: T.ink }}>추가 문의</h2>
          <p className="text-sm" style={{ color: T.ink2 }}>
            다른 궁금한 점이 있으시면{' '}
            <a href="mailto:rpdla041200@gmail.com" className="underline hover:opacity-80" style={{ color: T.ink }}>
              rpdla041200@gmail.com
            </a>
            으로 문의해 주세요.
          </p>
        </div>

        <div
          className="mt-6 rounded-2xl px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: T.brandSoft, border: `1.5px solid ${T.brand}22` }}
        >
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: T.ink }}>패키징 업체 찾고 계신가요?</p>
            <p className="text-xs" style={{ color: T.ink3 }}>1,380개 검증 업체 · 무료 비교</p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl no-underline hover:opacity-90 transition-opacity flex-none"
            style={{ background: T.brand, color: T.white }}
          >
            업체 찾기 →
          </Link>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${T.line}`, background: T.white }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-4 text-xs justify-center mb-3" style={{ color: '#94A3B8' }}>
            <Link href="/" className="hover:text-slate-600">홈</Link>
            <Link href="/faq" className="font-medium" style={{ color: T.ink2 }}>자주 묻는 질문</Link>
            <Link href="/guides" className="hover:text-slate-600">가이드</Link>
            <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
          </div>
          <div className="flex justify-center">
            <BusinessRegistrationInfo theme="light" />
          </div>
        </div>
      </footer>
    </div>
  )
}
