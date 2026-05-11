import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ) — Packlinx',
  description: 'Packlinx 서비스에 관한 자주 묻는 질문 — 정보 등록 표시, 업체 정보 수집 방식, 정보 삭제·수정 요청 안내.',
  alternates: {
    canonical: 'https://www.packlinx.com/faq',
  },
}

interface FaqItem {
  id: string
  question: string
  answer: React.ReactNode
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'what-is-jeongbo-deungrok',
    question: '「정보 등록」 표시는 무엇인가요?',
    answer: (
      <div className="space-y-4">
        {/* §0 한정 문구 — 필수, 변경 금지 (PACAA-509 LC §0) */}
        <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r text-sm text-neutral-800 leading-relaxed">
          <strong>한정 문구:</strong> 본 표시(
          <code className="bg-amber-100 px-1 rounded text-xs font-mono">정보 등록</code>
          )는 외부 공인 인증기관(예: KS, ISO, Korean Standards Association, 한국정보통신기술협회 등)이 발급한 인증이
          아닙니다. Packlinx 가 자체적으로 운영하는 등록 절차에 따라, 객관적·실증 가능한 기준을 만족한 업체에 한해 부여되는
          표시입니다.
        </div>

        <p className="text-sm text-neutral-700 leading-relaxed">
          「정보 등록」은 Packlinx 가 자체적으로 수립한 등록 절차를 통해, 아래의 객관적·실증 가능한 기준을 모두 충족한
          업체에 부여하는 표시입니다. 외부 공공기관이나 국가 인증기관의 인증과는 무관합니다.
        </p>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">§1 — 부여 기준 (5가지 모두 충족 필요)</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-neutral-700 ml-1">
            <li>사업자등록번호(BRN) 유효성 — 국세청 조회에서 &quot;계속사업자&quot; 상태 확인</li>
            <li>법인·사업자 명의 일치 — 국세청 조회 결과의 상호와 등록 상호가 일치</li>
            <li>웹사이트 도메인 실재성 — HTTP 정상 응답 + 도메인 소유자가 사업자와 동일 주체로 추정 가능</li>
            <li>통신판매업 신고 여부 — 공정거래위원회 통신판매사업자 조회 결과 존재 (미해당 업체는 면제 사유 기록)</li>
            <li>최소 1회 양방향 연락 가능성 확인 — 대표 이메일 또는 전화로 응답 확인</li>
          </ol>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">§2 — 갱신 주기</h4>
          <p className="text-sm text-neutral-700 leading-relaxed">
            12개월(연 1회) 정기 갱신. 업체 상호·사업자번호·도메인 변경, 또는 이용자 신고가 3건 이상 누적되면
            즉시 재검증을 실시합니다.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">§3 — 표시 박탈 사유</h4>
          <p className="text-sm text-neutral-700 leading-relaxed mb-1">
            다음 중 하나라도 해당하면 표시가 즉시 철회됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700 ml-1">
            <li>사업자등록 상태가 휴업·폐업·말소로 전환된 경우</li>
            <li>도메인 미응답이 14일 이상 지속된 경우</li>
            <li>최근 90일 내 양방향 연락 확인 실패</li>
            <li>통신판매업 신고가 직권 말소된 경우</li>
            <li>업체 본인의 박탈 요청</li>
            <li>사실 조사 결과 부여 기준이 충족되지 않음이 확인된 경우</li>
            <li>표시광고법·전자상거래법 위반으로 공정거래위원회 처분을 받은 사실이 공시된 경우</li>
          </ul>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          상세 기준 전문은{' '}
          <Link href="/terms#appendix-vendor-registration" className="underline hover:text-neutral-700">
            이용약관 별표 — Vendor 정보 등록 기준
          </Link>
          을 참고하세요.
        </p>
      </div>
    ),
  },
  {
    id: 'how-company-info-collected',
    question: '업체 정보는 어떻게 수집되나요?',
    answer: (
      <p className="text-sm text-neutral-700 leading-relaxed">
        Packlinx 는 인터넷에 공개된 사업자 정보(업체명, 웹사이트 URL, 카테고리, 취급 제품, 인증 정보, 사업 설명 등)를
        자동으로 수집·가공하여 게재합니다. 전화번호·주소·이메일 등 개인식별 연락처는 수집하지 않습니다.
        정보의 정확성·최신성·완전성은 보증되지 않으며, 오류가 있는 경우 아래의 정보 수정·삭제 요청을 통해 알려주세요.
      </p>
    ),
  },
  {
    id: 'request-correction-or-removal',
    question: '업체 정보 수정·삭제를 요청하려면 어떻게 하나요?',
    answer: (
      <div className="space-y-2 text-sm text-neutral-700">
        <p className="leading-relaxed">
          아래 방법으로 요청하실 수 있으며, 영업일 기준 24시간 이내에 처리 결과를 안내해 드립니다.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>
            온라인 신청:{' '}
            <Link href="/opt-out" className="underline hover:text-neutral-900">
              packlinx.com/opt-out
            </Link>
          </li>
          <li>
            이메일:{' '}
            <a href="mailto:rpdla041200@gmail.com" className="underline hover:text-neutral-900">
              rpdla041200@gmail.com
            </a>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'service-free',
    question: 'Packlinx 는 무료인가요?',
    answer: (
      <p className="text-sm text-neutral-700 leading-relaxed">
        네, Packlinx 의 업체 검색·열람 기능은 모두 무료입니다. 회원 가입 없이 이용하실 수 있습니다.
      </p>
    ),
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0F172A] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PacklinxLogo variant="dark" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-white/70 hover:text-white text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">자주 묻는 질문</h1>
        <p className="text-sm text-neutral-500 mb-8">Packlinx 서비스 이용에 관한 자주 묻는 질문을 안내합니다.</p>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.id}
              id={item.id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden group"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-neutral-50 transition-colors">
                <span className="text-[15px] font-semibold text-neutral-900 pr-4">{item.question}</span>
                <svg
                  className="w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-1 border-t border-neutral-100">{item.answer}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 bg-white border border-neutral-200 rounded-xl px-5 py-5">
          <h2 className="text-[15px] font-semibold text-neutral-900 mb-1">추가 문의</h2>
          <p className="text-sm text-neutral-600">
            다른 궁금한 점이 있으시면{' '}
            <a href="mailto:rpdla041200@gmail.com" className="underline hover:text-neutral-800">
              rpdla041200@gmail.com
            </a>
            으로 문의해 주세요.
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center mb-3">
            <Link href="/" className="hover:text-slate-600">홈</Link>
            <Link href="/faq" className="hover:text-slate-600 font-medium text-slate-600">자주 묻는 질문</Link>
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
