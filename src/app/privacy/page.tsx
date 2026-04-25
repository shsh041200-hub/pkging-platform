import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { TermsNoticeFooterLine } from '@/components/TermsNoticeFooterLine'

export const metadata: Metadata = {
  title: '개인정보처리방침 — Packlinx',
  description: 'Packlinx 개인정보처리방침 — 시행일 2026년 4월 26일',
}

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-neutral-500 mb-1">시행일: 2026년 4월 26일 0시 (KST)</p>
        <p className="text-sm text-neutral-500 mb-6">최종 개정일: 2026년 4월 26일</p>

        <div className="bg-brand-50 border-l-4 border-brand-700 px-4 py-3 mb-8 rounded-r">
          <p className="text-sm text-neutral-900">본 문서는 2026-04-26 0시 (KST) 부터 시행됩니다.</p>
        </div>

        <div className="space-y-8 text-sm text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제1조 (목적)</h2>
            <p>
              팩린스(이하 &quot;회사&quot;)는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
              관련 법령에 따라 정보주체의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수
              있도록 본 개인정보처리방침을 수립·공개합니다. 본 처리방침의 운영 도메인은 https://packlinx.com 입니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제2조 (처리하는 개인정보의 항목 및 처리 방법)</h2>
            <p className="mb-3">서비스는 회원가입 절차를 운영하지 않으며, 다음과 같은 항목·방법으로 개인정보를 처리합니다.</p>

            <h3 className="font-medium text-neutral-800 mb-2">① 공개 출처로부터의 자동 수집 (사업자 정보)</h3>
            <ul className="list-disc list-inside space-y-1 mb-1 ml-2">
              <li><strong>수집 항목</strong>: 업체명, 웹사이트 URL, 카테고리, 공개된 사업 설명·취급 제품·인증 정보</li>
              <li><strong>수집 방법</strong>: 인터넷에 공개된 사업자 정보를 자동화된 도구로 수집</li>
              <li><strong>수집 대상</strong>: 사업자(법인 또는 개인사업자)에 관한 공개 사업 정보에 한정</li>
            </ul>
            <p className="mb-1 ml-2"><strong>명시적 비수집 항목</strong>: 회사 정책에 따라 다음 항목은 <strong>수집·저장·노출하지 않습니다</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-3 ml-6">
              <li>사업자 전화번호 (DB 트리거로 INSERT/UPDATE 차단)</li>
              <li>사업장 주소(소재지)</li>
              <li>사업자 이메일</li>
              <li>개인(자연인)을 식별할 수 있는 정보</li>
              <li>민감정보 (「개인정보 보호법」 제23조)</li>
            </ul>

            <h3 className="font-medium text-neutral-800 mb-2 mt-4">② 서비스 이용 과정에서 자동 생성·수집되는 정보</h3>
            <ul className="list-disc list-inside space-y-1 mb-3 ml-2">
              <li><strong>수집 항목</strong>: 세션 식별자(브라우저 localStorage에 저장되는 UUID), 페이지 조회·클릭 이벤트(예: 카카오톡 클릭, 외부 웹사이트 이동, 업체 상세 조회), 참조 URL(referrer), 광고 캠페인 식별자(UTM source / medium / campaign), 접속 일시, 이벤트 메타데이터</li>
              <li><strong>수집 방법</strong>: 이용자 단말의 자바스크립트를 통해 자동 전송</li>
              <li><strong>저장 위치</strong>: conversion_events 테이블 (Supabase)</li>
              <li><strong>IP 주소 처리</strong>: API 요청 빈도 제한(rate limit)을 위해 메모리에서만 일시 사용하며, 데이터베이스에 저장하지 않습니다.</li>
            </ul>

            <h3 className="font-medium text-neutral-800 mb-2 mt-4">③ 정보 정정·삭제 요청 시 수집 (<Link href="/opt-out" className="underline text-neutral-700 hover:text-neutral-900">/opt-out</Link> 페이지)</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>수집 항목</strong>: 요청 대상 업체명, 요청 유형(삭제/정정), 요청자 이름, 요청자 이메일, 요청 사유</li>
              <li><strong>수집 방법</strong>: 이용자가 양식에 직접 입력하여 제출</li>
              <li><strong>법적 근거</strong>: 「개인정보 보호법」 제35조(열람), 제36조(정정·삭제), 제37조(처리정지)에 따른 정보주체의 권리 행사 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제3조 (개인정보의 처리 목적)</h2>
            <p className="mb-2">회사는 다음 목적을 위하여 개인정보를 처리합니다.</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>B2B 패키징 업체 디렉토리 서비스 제공 (검색·열람·비교)</li>
              <li>서비스 이용 통계 분석 및 서비스 개선</li>
              <li>광고·마케팅 캠페인 효과 측정 (UTM 파라미터 분석)</li>
              <li>정보주체의 권리 행사(열람·정정·삭제·처리정지) 처리</li>
              <li>법령상 의무 이행 및 분쟁 대응</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제4조 (개인정보의 처리 및 보유 기간)</h2>
            <div className="overflow-x-auto mb-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">처리 목적</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2">사업자 디렉토리 정보</td>
                    <td className="border border-neutral-200 px-3 py-2">서비스 제공 기간 동안 보유, 정보주체의 삭제 요청 시 지체 없이 파기</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2">자동 수집 이벤트 데이터 (conversion_events)</td>
                    <td className="border border-neutral-200 px-3 py-2">수집일로부터 2년 (통계 분석 종료 시 즉시 파기)</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2">정보 정정·삭제 요청 기록 (opt_out_requests)</td>
                    <td className="border border-neutral-200 px-3 py-2">처리 완료 후 3년 (분쟁 대응 목적)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-neutral-600">법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 별도 보관합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제5조 (개인정보의 제3자 제공)</h2>
            <p className="mb-2">회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만 다음의 경우는 예외로 합니다.</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>정보주체의 사전 동의가 있는 경우</li>
              <li>다른 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
              <li>수사기관이 「형사소송법」, 「통신비밀보호법」 등 법령에 정한 절차와 방법에 따라 요구한 경우</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제6조 (개인정보 처리의 위탁 및 국외 이전)</h2>
            <p className="mb-3">
              회사는 안정적인 서비스 운영을 위해 개인정보 처리 업무의 일부를 다음과 같이 위탁하고 있으며,
              위탁 업무의 일부는 국외에서 이루어집니다(「개인정보 보호법」 제28조의8).
            </p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">수탁자</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">위탁 업무</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">이전 항목</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">이전 국가</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">이전 방법</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium whitespace-nowrap">Supabase Inc.</td>
                    <td className="border border-neutral-200 px-3 py-2">데이터베이스 호스팅, 인증·스토리지</td>
                    <td className="border border-neutral-200 px-3 py-2">제2조의 자동수집·정정요청 항목 전체</td>
                    <td className="border border-neutral-200 px-3 py-2 whitespace-nowrap">미국</td>
                    <td className="border border-neutral-200 px-3 py-2">서비스 이용 시 실시간, HTTPS(TLS 1.2 이상)</td>
                    <td className="border border-neutral-200 px-3 py-2">위탁계약 종료 시까지</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium whitespace-nowrap">Vercel Inc.</td>
                    <td className="border border-neutral-200 px-3 py-2">웹 애플리케이션 호스팅, CDN, 접속 로그</td>
                    <td className="border border-neutral-200 px-3 py-2">접속 IP, User-Agent, 요청 URL</td>
                    <td className="border border-neutral-200 px-3 py-2 whitespace-nowrap">미국</td>
                    <td className="border border-neutral-200 px-3 py-2">서비스 접속 시 실시간, HTTPS</td>
                    <td className="border border-neutral-200 px-3 py-2">Vercel 표준 보존 기간(약 30일)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-neutral-600">
              회사는 위탁 계약 시 「개인정보 보호법」 제26조 제1항에 따라 위탁업무의 목적·범위, 재위탁 제한,
              안전성 확보조치, 손해배상 등 책임에 관한 사항을 명시하고, 수탁자가 이를 준수하도록 감독하고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제7조 (정보주체의 권리·의무 및 행사 방법)</h2>
            <p className="mb-2">정보주체(사업자 또는 그 대리인을 포함합니다)는 다음 권리를 행사할 수 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">
              <li>개인정보 처리 현황 열람 요구 (법 제35조)</li>
              <li>오류 등이 있을 경우 정정 요구 (법 제36조)</li>
              <li>삭제 요구 (법 제36조)</li>
              <li>처리 정지 요구 (법 제37조)</li>
            </ol>
            <p className="mb-2">권리 행사는 다음 경로 중 하나로 신청하실 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                정보 정정·삭제 요청 페이지:{' '}
                <Link href="/opt-out" className="underline text-neutral-700 hover:text-neutral-900">
                  https://packlinx.com/opt-out
                </Link>
              </li>
              <li>개인정보 보호책임자 이메일 (제10조 참조)</li>
            </ul>
            <p className="mt-2 text-neutral-600">
              회사는 요청 접수 후 10일 이내에 처리 결과를 회신합니다(「개인정보 보호법 시행령」 제43조 제3항).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제8조 (쿠키·세션식별자의 운영 및 거부)</h2>
            <p className="mb-2">서비스는 이용 분석을 위해 다음과 같은 식별자를 사용합니다.</p>
            <ul className="list-disc list-inside space-y-1 mb-2 ml-2">
              <li>
                <strong>세션 식별자</strong>: 브라우저 localStorage에 <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">pkging_session_id</code> 키로 저장되는 UUID.
                단일 방문자의 행동을 동일 세션으로 묶기 위한 용도이며, 개인을 직접 식별하지 않습니다.
              </li>
              <li>
                <strong>쿠키</strong>: Vercel·Supabase 운영상 필요한 세션 쿠키가 일시적으로 사용될 수 있습니다.
              </li>
            </ul>
            <p className="text-neutral-600">
              이용자는 브라우저 설정 또는 localStorage 삭제를 통해 세션 식별자를 제거할 수 있습니다.
              단, 일부 분석 기능이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제9조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-2">회사는 「개인정보 보호법」 제29조 및 「개인정보의 안전성 확보조치 기준」에 따라 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>HTTPS(TLS 1.2 이상) 전송 암호화</li>
              <li>데이터베이스 접근 권한 최소화 (Supabase Row-Level Security 적용)</li>
              <li>서비스 운영자 외 외부 접근 차단(service_role 권한 분리)</li>
              <li>정기적 보안 점검 및 취약점 조치</li>
              <li>접속 기록의 보관·점검 (Vercel 로그)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제10조 (개인정보 보호책임자)</h2>
            <p className="mb-3">회사는 개인정보 처리에 관한 업무를 총괄·책임지는 개인정보 보호책임자를 다음과 같이 지정합니다.</p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">구분</th>
                    <th className="border border-neutral-200 px-3 py-2 text-left font-medium text-neutral-800">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">성명</td>
                    <td className="border border-neutral-200 px-3 py-2">김선혁</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">직책</td>
                    <td className="border border-neutral-200 px-3 py-2">대표·운영자 / 개인정보 보호책임자</td>
                  </tr>
                  <tr>
                    <td className="border border-neutral-200 px-3 py-2 font-medium">이메일</td>
                    <td className="border border-neutral-200 px-3 py-2">
                      <a href="mailto:privacy@packlinx.com" className="underline text-neutral-700 hover:text-neutral-900">
                        privacy@packlinx.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-neutral-600 text-xs mb-4">
              ※ 개인정보 보호 정책(전화번호 비수집·비공개)에 따라 이메일 단일 창구로 운영합니다.
            </p>
            <p className="mb-2 text-neutral-600">개인정보 침해에 관한 신고나 상담은 아래 기관에 문의하실 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-xs text-neutral-500">
              <li>개인정보 침해신고센터: privacy.kisa.or.kr / ☎ 118</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr / ☎ 1833-6972</li>
              <li>대검찰청 사이버수사과: www.spo.go.kr / ☎ 1301</li>
              <li>경찰청 사이버안전국: ecrm.cyber.go.kr / ☎ 182</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제11조 (가명정보 처리에 관한 사항)</h2>
            <p>
              회사는 현재 「개인정보 보호법」 제28조의2에 따른 가명정보를 처리하지 않습니다.
              향후 가명정보를 처리하는 경우, 그 항목·목적·보유기간 등을 본 처리방침에 추가하여 공개합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제12조 (만 14세 미만 아동의 개인정보)</h2>
            <p>
              서비스는 B2B(사업자 간 거래) 디렉토리로서 사업자를 대상으로 하며,
              만 14세 미만 아동의 개인정보를 의도적으로 수집·이용하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제13조 (영상정보처리기기 운영)</h2>
            <p>회사는 영상정보처리기기(CCTV 등)를 운영하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제14조 (자동화된 결정·프로파일링)</h2>
            <p>
              회사는 정보주체의 권리·의무에 영향을 미치는 자동화된 결정(「개인정보 보호법」 제37조의2)을
              수행하지 않습니다. 검색·필터·추천 결과는 단순 정보 제공이며, 거래 체결·신용 평가 등
              정보주체에게 법적 효과를 미치는 결정에 사용되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제15조 (이메일 주소 무단 수집 거부)</h2>
            <p>
              서비스에 게시된 이메일 주소는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조의2에
              따라 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용한 무단 수집을 거부합니다.
              위반 시 같은 법에 따라 형사 처벌될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">제16조 (개인정보처리방침의 변경)</h2>
            <p className="mb-2">이 개인정보처리방침은 법령·정책 또는 보안 기술의 변경에 따라 변경될 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>일반적인 변경: 시행 7일 전 홈페이지 공지</li>
              <li>정보주체에게 <strong>불리한 변경</strong>(권리 축소, 처리 항목 추가 등): 시행 30일 전 홈페이지 공지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">부칙</h2>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>본 처리방침은 2026년 4월 26일 0시(KST)부터 적용합니다.</li>
              <li>이전 처리방침은 별도 보관하며, 요청 시 제공합니다.</li>
            </ol>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <TermsNoticeFooterLine theme="light" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600 font-medium text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
          <Link href="/opt-out?type=takedown" className="hover:text-slate-600">권리침해 신고</Link>
        </div>
      </footer>
    </div>
  )
}
