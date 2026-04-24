import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'

export const metadata: Metadata = {
  title: '개인정보처리방침 — Packlinx',
  description: 'Packlinx 개인정보처리방침',
}

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-slate-500 mb-8">시행일: 2026년 4월 19일</p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제1조 (목적)</h2>
            <p>
              Packlinx(이하 &quot;서비스&quot;)은 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호
              등에 관한 법률」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을
              신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제2조 (수집하는 개인정보 항목 및 수집 방법)</h2>
            <p className="mb-2">서비스는 다음과 같은 방법으로 개인정보를 수집합니다.</p>
            <h3 className="font-medium text-slate-800 mb-1">① 공개 출처로부터의 자동 수집 (크롤링)</h3>
            <p className="mb-3">
              서비스는 인터넷상에 공개된 사업자 정보(업체명, 전화번호, 이메일, 사업장 주소, 웹사이트 URL 등)를
              자동화된 방법으로 수집하여 B2B 디렉토리 서비스를 제공합니다. 수집 대상은 사업자에
              관한 공개 정보이며, 개인(자연인)의 민감한 정보는 수집하지 않습니다.
            </p>
            <h3 className="font-medium text-slate-800 mb-1">② 서비스 이용 과정에서 자동으로 생성·수집되는 정보</h3>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>IP 주소, 접속 로그, 쿠키, 방문 일시, 서비스 이용 기록</li>
            </ul>
            <p className="text-xs text-slate-500 bg-slate-100 rounded p-3">
              서비스는 현재 회원 가입 기능을 제공하지 않으며, 별도의 회원정보를 수집하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제3조 (개인정보의 처리 목적)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>B2B 포장업체 디렉토리 서비스 제공</li>
              <li>업체 정보 검색 및 안내</li>
              <li>서비스 운영·개선 및 이용 통계 분석</li>
              <li>법령상 의무 이행</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제4조 (개인정보의 처리 및 보유 기간)</h2>
            <p className="mb-2">
              수집된 사업자 정보는 서비스 제공 기간 동안 보유하며, 정보 주체가 삭제·정정을 요청하거나
              수집 목적이 달성된 경우 지체 없이 삭제합니다.
            </p>
            <p>
              단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제5조 (개인정보의 제3자 제공)</h2>
            <p>
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>정보 주체의 동의가 있는 경우</li>
              <li>법령에 의하거나 수사 목적으로 법령이 정한 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제6조 (개인정보 처리의 위탁)</h2>
            <p>
              서비스는 Supabase Inc.에 데이터베이스 호스팅을 위탁하고 있습니다.
              위탁 업무 처리 목적 이외의 개인정보 처리를 금지하고, 기술적·관리적 보호 조치,
              재위탁 제한 등을 계약에 규정합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제7조 (정보 주체의 권리·의무 및 행사 방법)</h2>
            <p className="mb-2">
              정보 주체(사업자 포함)는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p>
              권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하시면 처리합니다.
              요청 접수 후 10일 이내에 답변 드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제8조 (쿠키의 설치·운영 및 거부)</h2>
            <p className="mb-2">
              서비스는 서비스 운영을 위해 세션 쿠키를 사용할 수 있습니다. 이용자는 웹 브라우저의
              옵션 설정을 통해 쿠키 수신을 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제9조 (개인정보의 안전성 확보 조치)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>HTTPS를 통한 데이터 전송 암호화</li>
              <li>데이터베이스 접근 권한 최소화</li>
              <li>정기적인 보안 점검</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제10조 (개인정보 보호책임자)</h2>
            <div className="bg-slate-100 rounded-lg p-4 text-sm">
              <p className="font-medium text-slate-800 mb-1">개인정보 보호책임자</p>
              <p>이메일: privacy@pkging.kr</p>
              <p className="text-xs text-slate-500 mt-1">
                ※ 개인정보 관련 문의, 불만 처리, 피해 구제 등에 관한 사항은 위 연락처로 문의해 주시기 바랍니다.
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              개인정보 침해에 관한 신고나 상담은 아래 기관에 문의하실 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1 text-xs text-slate-500">
              <li>개인정보 침해신고센터: privacy.kisa.or.kr / ☎ 118</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr / ☎ 1833-6972</li>
              <li>대검찰청 사이버수사과: www.spo.go.kr / ☎ 1301</li>
              <li>경찰청 사이버안전국: ecrm.cyber.go.kr / ☎ 182</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-3">제11조 (개인정보처리방침의 변경)</h2>
            <p>
              이 개인정보처리방침은 법령·정책 또는 보안 기술의 변경에 따라 변경될 수 있습니다.
              변경 시에는 홈페이지 공지를 통하여 이전 방침과 함께 고지하겠습니다.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600 font-medium text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
        </div>
      </footer>
    </div>
  )
}
