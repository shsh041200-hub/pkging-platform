import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'

export const metadata: Metadata = {
  title: '이용약관 — Packlinx',
  description: 'Packlinx 이용약관',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">이용약관</h1>
        <p className="text-sm text-slate-500 mb-8">시행일: 2026년 4월 19일</p>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 Packlinx(이하 &quot;서비스&quot;)의 이용에 관한 조건 및 절차, 이용자와 서비스 운영자의
              권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>&quot;서비스&quot;란 전국 B2B 포장업체 디렉토리를 제공하는 웹사이트(pkging.kr)를 의미합니다.</li>
              <li>&quot;이용자&quot;란 서비스에 접속하여 서비스를 이용하는 모든 자를 의미합니다.</li>
              <li>&quot;등록 업체&quot;란 서비스에 정보가 게재된 사업자를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <p className="mb-2">
              ① 이 약관은 서비스를 이용하는 모든 이용자에게 효력이 발생합니다.
            </p>
            <p>
              ② 서비스는 약관을 변경할 경우 변경 내용을 홈페이지에 공지하며, 공지 후 7일 이후에
              효력이 발생합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제4조 (서비스의 내용)</h2>
            <p className="mb-2">서비스는 다음과 같은 기능을 제공합니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>전국 포장업체 정보 검색 및 열람</li>
              <li>카테고리별 업체 분류 및 필터링</li>
              <li>업체 상세 정보 제공 (전화, 이메일, 웹사이트, 취급 제품, 인증 정보 등)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제5조 (정보의 수집 및 정확성)</h2>
            <p className="mb-2">
              ① 서비스에 게재된 업체 정보는 인터넷상에 공개된 정보를 자동으로 수집한 것으로,
              정보의 정확성·최신성을 완전히 보장하지 않습니다.
            </p>
            <p className="mb-2">
              ② 등록 업체 또는 제3자는 자신에 관한 정보의 오류 정정, 추가, 삭제를 아래 연락처로
              요청할 수 있으며, 서비스는 요청 접수 후 10일 이내에 처리합니다.
            </p>
            <div className="bg-slate-100 rounded-lg p-3 text-sm">
              <p>정보 수정·삭제 요청: privacy@pkging.kr</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제6조 (이용자의 의무)</h2>
            <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스를 통해 수집한 업체 정보를 무단으로 대량 복제·배포하는 행위</li>
              <li>서비스 운영을 방해하는 행위</li>
              <li>서비스에서 얻은 정보를 스팸 발송, 불법 마케팅 등에 이용하는 행위</li>
              <li>기타 법령 또는 이 약관에 위반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제7조 (면책 조항)</h2>
            <p className="mb-2">
              ① 서비스에 게재된 업체 정보는 참고용이며, 서비스는 해당 정보의 정확성, 완전성,
              적시성에 대해 보증하지 않습니다.
            </p>
            <p className="mb-2">
              ② 이용자가 서비스에 게재된 업체 정보를 신뢰하여 행한 거래에 대해 서비스는
              책임을 지지 않습니다.
            </p>
            <p className="mb-2">
              ③ 서비스는 천재지변, 시스템 장애, 불가항력적 사유로 인한 서비스 중단에 대해
              책임을 지지 않습니다.
            </p>
            <p>
              ④ 이용자가 서비스에서 수집한 연락처를 이용하여 발생한 문제에 대해 서비스는
              책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제8조 (저작권)</h2>
            <p className="mb-2">
              ① 서비스가 제작한 콘텐츠(UI, 디자인, 분류 체계, 작성 설명문 등)의 저작권은
              서비스 운영자에게 있습니다.
            </p>
            <p className="mb-2">
              ② 업체로부터 수집한 공개 정보(업체명, 주소, 전화번호 등)는 해당 업체에
              귀속됩니다.
            </p>
            <p>
              ③ 이용자는 서비스의 콘텐츠를 사전 허락 없이 복제·배포·편집·전시하는 등
              상업적으로 이용할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제9조 (이메일 주소 무단 수집 금지)</h2>
            <p className="font-medium text-slate-800 bg-amber-50 border border-amber-200 rounded p-3">
              본 서비스에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를
              이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 「정보통신망 이용촉진 및
              정보보호 등에 관한 법률」에 의해 형사 처벌될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제10조 (분쟁 해결)</h2>
            <p>
              이 약관에 관한 분쟁은 대한민국 법을 적용하며, 분쟁이 발생한 경우 서비스 운영자의
              소재지를 관할하는 법원을 전속 관할 법원으로 합니다.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600 font-medium text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
        </div>
      </footer>
    </div>
  )
}
