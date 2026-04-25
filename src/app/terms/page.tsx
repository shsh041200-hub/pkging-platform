import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { TermsNoticeFooterLine } from '@/components/TermsNoticeFooterLine'

export const metadata: Metadata = {
  title: '이용약관 — Packlinx',
  description: 'Packlinx 이용약관 — 시행일 2026년 4월 26일',
}

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">이용약관</h1>
        <p className="text-sm text-neutral-500 mb-6">시행일: 2026년 4월 26일 0시 (KST)</p>

        <div className="bg-brand-50 border-l-4 border-brand-700 px-4 py-3 mb-8 rounded-r">
          <p className="text-sm text-neutral-900">본 문서는 2026-04-26 0시 (KST) 부터 시행됩니다.</p>
        </div>

        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 팩린스(이하 &quot;회사&quot;)가 운영하는 packlinx.com (이하 &quot;서비스&quot;)의 이용에 관한
              조건과 절차, 이용자와 회사의 권리·의무 및 책임 사항을 정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                &quot;서비스&quot;란 회사가 packlinx.com 도메인을 통해 제공하는 전국 B2B 패키징 업체 디렉토리 검색 서비스를 말합니다.
              </li>
              <li>
                &quot;이용자&quot;란 본 약관에 따라 서비스에 접속하여 서비스를 이용하는 모든 자를 말합니다.
              </li>
              <li>
                &quot;등록 업체&quot;란 서비스에 정보가 게재된 사업자(법인 또는 개인사업자)를 말합니다.
              </li>
              <li>
                &quot;공개 정보&quot;란 인터넷에 공개된 사업자의 비식별 사업 정보(업체명, 웹사이트 URL, 카테고리,
                사업 설명, 취급 제품, 인증 정보 등)를 말하며, 회사 정책에 따라 전화번호·주소·이메일은 제외됩니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>이 약관은 서비스를 이용하는 모든 이용자에게 효력이 발생합니다.</li>
              <li>
                회사는 본 약관을 변경할 수 있으며, 변경 시 시행일과 변경 사유를 명시하여 시행 7일 전부터 홈페이지에 공지합니다.
              </li>
              <li>
                다만, 이용자에게 <strong>불리한 변경</strong> 또는 <strong>중대한 변경</strong>의 경우에는 시행 30일 전부터 공지합니다.
              </li>
              <li>
                이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단할 수 있습니다.
                변경된 약관 시행일 이후에 서비스를 계속 이용하는 경우 변경에 동의한 것으로 간주합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제4조 (서비스의 내용)</h2>
            <p className="mb-2">회사는 다음과 같은 기능을 제공합니다.</p>
            <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">
              <li>전국 B2B 패키징 업체 정보 검색 및 열람</li>
              <li>카테고리·지역별 업체 분류 및 필터링</li>
              <li>업체 상세 정보 제공 (업체명, 웹사이트 URL, 카테고리, 취급 제품, 인증 정보, 공개 사업 설명 등)</li>
              <li>
                업체 정보 정정·삭제 요청 접수 (
                <Link href="/opt-out" className="underline text-neutral-700 hover:text-neutral-900">/opt-out</Link>
                )
              </li>
              <li>패키징 산업 가이드·블로그 콘텐츠 제공</li>
            </ol>
            <p className="text-neutral-600">
              회사는 서비스에 등록 업체의 <strong>전화번호·주소·이메일</strong>을 게재하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제5조 (정보의 수집 및 정확성)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                서비스에 게재된 업체 정보는 인터넷에 공개된 정보를 자동으로 수집하여 가공한 것이며,
                회사는 정보의 정확성·최신성·완전성을 보증하지 않습니다.
              </li>
              <li>
                등록 업체 또는 정당한 권한이 있는 제3자는 자신에 관한 정보의 정정·삭제·추가를 다음 경로로 요청할 수 있습니다.
                <ul className="list-disc list-inside space-y-1 mt-1 ml-4">
                  <li>
                    정보 정정·삭제 요청:{' '}
                    <Link href="/opt-out" className="underline text-neutral-700 hover:text-neutral-900">
                      https://packlinx.com/opt-out
                    </Link>
                  </li>
                  <li>
                    이메일:{' '}
                    <a href="mailto:privacy@packlinx.com" className="underline text-neutral-700 hover:text-neutral-900">
                      privacy@packlinx.com
                    </a>
                  </li>
                </ul>
              </li>
              <li>회사는 요청 접수 후 10일 이내에 처리 결과를 회신합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제6조 (이용자의 의무)</h2>
            <p className="mb-2">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">
              <li>서비스에서 얻은 업체 정보를 무단으로 대량 복제·배포·재판매하는 행위</li>
              <li>자동화 도구·크롤러·스크래퍼를 이용하여 서비스의 정보를 무단으로 수집·복제하는 행위</li>
              <li>서비스에서 얻은 정보를 스팸 발송, 무단 마케팅, 사기 등 불법 목적에 이용하는 행위</li>
              <li>서비스 운영을 방해하는 행위 (서비스 거부 공격, 비정상 대량 요청 등)</li>
              <li>회사 또는 등록 업체의 명예를 훼손하거나 권리를 침해하는 행위</li>
              <li>기타 법령 또는 본 약관에 위반하는 행위</li>
            </ol>
            <p className="text-neutral-600">
              위반 시 회사는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제48조 등 관련 법령에 따른 형사·민사상 책임을 청구할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제7조 (서비스의 변경 및 중단)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                회사는 서비스의 일부 또는 전부를 변경하거나 중단할 수 있으며, 변경·중단 시 사전 공지를 원칙으로 합니다.
              </li>
              <li>
                회사는 천재지변, 시스템 장애, 보안 사고, 정책 변경 등 불가피한 사유가 있는 경우 사전 공지 없이 서비스를 일시 중단할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제8조 (책임 한계 및 면책)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                서비스에 게재된 업체 정보는 참고용이며, 회사는 정보의 정확성·완전성·적시성에 대해 보증하지 않습니다.
              </li>
              <li>
                이용자가 서비스 정보를 신뢰하여 등록 업체와 행한 거래에 대해 회사는 거래 당사자가 아니며 책임을 지지 않습니다.
                본 서비스는 사이트 내에서 직접 거래·결제·계약 중개 행위를 수행하지 않으며, 「전자상거래 등에서의 소비자보호에 관한
                법률」 제20조의 통신판매중개자에 해당하지 않습니다. 이용자와 등록 업체 간 발생하는 분쟁에 회사는 개입하지 않으나,
                법령상 의무가 있는 경우에는 이를 따릅니다.
              </li>
              <li>
                천재지변, 시스템 장애, 통신망 장애, 위탁 인프라(Supabase, Vercel 등) 장애, 그 밖의 불가항력적 사유로 인한
                서비스 중단·정보 손실에 대해 회사는 책임을 지지 않습니다.
              </li>
              <li>
                이용자가 본 약관 제6조를 위반하여 발생한 손해에 대해 회사는 책임을 지지 않으며,
                이용자는 그로 인해 회사가 입은 손해를 배상할 책임이 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제9조 (지식재산권)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                서비스가 제작·편집한 콘텐츠(UI, 디자인, 분류 체계, 작성된 설명문, 가이드·블로그 등)의 저작권은 회사에 귀속됩니다.
              </li>
              <li>
                등록 업체로부터 수집한 공개 정보(업체명, 웹사이트, 카테고리 등)는 해당 업체에 귀속되며,
                회사는 본 서비스 운영 목적으로 이를 게시·제공할 수 있습니다.
              </li>
              <li>
                회사가 구축한 데이터베이스의 전부 또는 상당 부분에 대한 무단 복제·배포·전송·전시는
                「저작권법」 제93조에 따른 데이터베이스 제작자의 권리를 침해하는 행위로, 민·형사상 책임을 부담할 수 있습니다.
              </li>
              <li>
                이용자는 회사 또는 정당한 권리자의 사전 서면 동의 없이 서비스의 콘텐츠를 복제·배포·편집·전시하거나
                상업적으로 이용할 수 없습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제10조 (이메일 주소 무단 수집 거부)</h2>
            <p>
              서비스에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을
              거부합니다. 위반 시 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조의2에 따라 형사 처벌될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제11조 (개인정보의 보호)</h2>
            <p>
              회사는 이용자의 개인정보를 「개인정보 보호법」 등 관련 법령에 따라 보호하며, 자세한 사항은 본 서비스의{' '}
              <Link href="/privacy" className="underline text-neutral-700 hover:text-neutral-900">
                개인정보처리방침
              </Link>
              에서 정합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제12조 (분쟁 해결 및 준거법·관할)</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>본 약관과 서비스 이용에 관한 분쟁에는 대한민국 법을 적용합니다.</li>
              <li>
                분쟁이 발생한 경우 양 당사자는 신의에 따라 원만히 해결하도록 노력하며, 합의되지 않을 경우
                회사 운영주체의 주소지를 관할하는 법원을 제1심 관할 법원으로 합니다.
              </li>
              <li>
                개인정보 처리에 관한 분쟁은 「개인정보 보호법」 제43조에 따라 개인정보 분쟁조정위원회
                (☎ 1833-6972, www.kopico.go.kr)에 조정을 신청할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제13조 (회사 정보)</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">구분</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">서비스명</td>
                    <td className="border border-neutral-200 px-3 py-2">Packlinx (packlinx.com)</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">사업형태</td>
                    <td className="border border-neutral-200 px-3 py-2">개인사업자 (일반과세자)</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">상호</td>
                    <td className="border border-neutral-200 px-3 py-2">팩린스</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">대표자</td>
                    <td className="border border-neutral-200 px-3 py-2">김선혁</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">사업자등록번호</td>
                    <td className="border border-neutral-200 px-3 py-2">896-20-02557</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">통신판매업 신고</td>
                    <td className="border border-neutral-200 px-3 py-2">
                      미해당 — 본 서비스는 사이트 내 직접 거래·결제·중개를 수행하지 않으며,
                      「전자상거래 등에서의 소비자보호에 관한 법률」 제20조의 통신판매중개자 정의에 해당하지 않습니다.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">대표 이메일</td>
                    <td className="border border-neutral-200 px-3 py-2">
                      <a href="mailto:privacy@packlinx.com" className="underline text-neutral-700 hover:text-neutral-900">
                        privacy@packlinx.com
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">개인정보 보호책임자</td>
                    <td className="border border-neutral-200 px-3 py-2">
                      김선혁 (대표·운영자) /{' '}
                      <a href="mailto:privacy@packlinx.com" className="underline text-neutral-700 hover:text-neutral-900">
                        privacy@packlinx.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">부칙</h2>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>본 약관은 2026년 4월 26일 0시(KST)부터 적용합니다.</li>
              <li>
                본 약관은 임시 시행안이며, 사업자 등록 절차 완료 시(또는 그에 준하는 회사 신원 확정 시)
                즉시 정식 갱신·재공지합니다.
              </li>
            </ol>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <TermsNoticeFooterLine theme="light" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600 font-medium text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
          <Link href="/opt-out?type=takedown" className="hover:text-slate-600">권리침해 신고</Link>
        </div>
      </footer>
    </div>
  )
}
