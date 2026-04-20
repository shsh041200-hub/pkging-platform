import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '정보 삭제·수정 요청 — Korea Pack',
  description: 'Korea Pack에 등록된 업체 정보의 삭제 또는 수정을 요청하실 수 있습니다.',
}

export default function OptOutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-white font-bold text-lg tracking-wide">K&amp;P</span>
            <span className="text-slate-400 text-xs hidden sm:inline">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">정보 삭제·수정 요청</h1>
        <p className="text-sm text-slate-500 mb-8">
          Korea Pack에 등록된 귀사 정보의 삭제 또는 수정을 요청하실 수 있습니다.
          접수 후 10영업일 이내에 처리 결과를 이메일로 안내드립니다.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <p className="font-medium mb-1">이메일로 직접 요청하실 수 있습니다</p>
          <p>
            <a href="mailto:privacy@pkging.kr" className="underline font-medium">
              privacy@pkging.kr
            </a>
            으로 업체명과 요청 내용을 보내주시면 동일하게 처리해 드립니다.
          </p>
        </div>

        <form
          action="https://formsubmit.co/privacy@pkging.kr"
          method="POST"
          className="space-y-5"
        >
          {/* FormSubmit hidden fields */}
          <input type="hidden" name="_subject" value="[Korea Pack] 정보 삭제·수정 요청" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_next" value="https://pkging.kr/opt-out/thanks" />

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
              업체명 <span className="text-red-500">*</span>
            </label>
            <input
              id="company"
              name="업체명"
              type="text"
              required
              placeholder="예: (주)한국포장"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              업체 웹사이트 URL
            </label>
            <input
              id="website"
              name="웹사이트_URL"
              type="url"
              placeholder="https://example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="request_type" className="block text-sm font-medium text-slate-700 mb-1">
              요청 유형 <span className="text-red-500">*</span>
            </label>
            <select
              id="request_type"
              name="요청_유형"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">선택해 주세요</option>
              <option value="삭제">정보 삭제 (디렉토리에서 완전 제거)</option>
              <option value="수정">정보 수정 (특정 항목 변경)</option>
              <option value="크롤링_차단">크롤링 중단 요청</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="detail" className="block text-sm font-medium text-slate-700 mb-1">
              요청 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="detail"
              name="요청_내용"
              required
              rows={4}
              placeholder="삭제 또는 수정하실 내용을 구체적으로 기재해 주세요."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-1">
              회신용 이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="contact"
              name="회신_이메일"
              type="email"
              required
              placeholder="your@email.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-[#0d1d2e] text-white font-medium py-2.5 text-sm hover:bg-slate-700 transition-colors"
            >
              요청 제출
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            제출하신 정보는 요청 처리 목적으로만 사용되며, 처리 완료 후 파기됩니다.
          </p>
        </form>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600 font-medium text-slate-600">정보 삭제·수정 요청</Link>
        </div>
      </footer>
    </div>
  )
}
