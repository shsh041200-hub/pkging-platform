'use client'

import { useEffect, useState, useCallback } from 'react'

type JobStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

interface CrawlJob {
  id: string
  url: string
  status: JobStatus
  company_id: string | null
  error: string | null
  created_at: string
  updated_at: string
}

const STATUS_STYLES: Record<JobStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  running: 'bg-blue-50 text-blue-700',
  done: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  skipped: 'bg-amber-50 text-amber-700',
}

const STATUS_LABELS: Record<JobStatus, string> = {
  pending: '대기',
  running: '실행 중',
  done: '완료',
  failed: '실패',
  skipped: '건너뜀',
}

export default function AdminCrawlPage() {
  const [jobs, setJobs] = useState<CrawlJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [runNow, setRunNow] = useState(true)
  const [submitResult, setSubmitResult] = useState('')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/crawl')
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '불러오기 실패')
    } else {
      setJobs(json.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitResult('')

    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'))

    if (urls.length === 0) {
      setSubmitResult('유효한 URL이 없습니다. http:// 또는 https://로 시작하는 URL을 입력하세요.')
      setSubmitting(false)
      return
    }

    if (urls.length > 50) {
      setSubmitResult('한 번에 최대 50개 URL까지 가능합니다.')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/admin/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, runNow }),
    })
    const json = await res.json()

    if (!res.ok) {
      setSubmitResult(`오류: ${json.error ?? '제출 실패'}`)
    } else if (runNow) {
      const done = (json.results as Array<{ status: string }>).filter((r) => r.status === 'done').length
      const failed = (json.results as Array<{ status: string }>).filter((r) => r.status === 'failed').length
      setSubmitResult(`완료: ${done}개 성공, ${failed}개 실패`)
      setUrlInput('')
      fetchJobs()
    } else {
      setSubmitResult(`${json.queued}개 URL이 큐에 등록되었습니다.`)
      setUrlInput('')
      fetchJobs()
    }

    setSubmitting(false)
  }

  async function runJob(jobId: string) {
    const res = await fetch('/api/admin/crawl/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (res.ok) {
      fetchJobs()
    }
  }

  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">크롤링 관리</h1>
          <p className="text-sm text-slate-500 mt-1">포장업체 웹사이트 URL을 등록하고 크롤링 작업을 관리합니다.</p>
        </div>
        <button
          onClick={fetchJobs}
          className="border border-slate-300 text-slate-700 text-sm px-4 py-2 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {(Object.entries(STATUS_LABELS) as [JobStatus, string][]).map(([status, label]) => (
            <div key={status} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{statusCounts[status] ?? 0}</div>
              <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${STATUS_STYLES[status]}`}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL Submit Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">URL 등록</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              크롤링할 URL <span className="text-slate-400 font-normal">(줄바꿈으로 구분, 최대 50개)</span>
            </label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              rows={5}
              placeholder={'https://example-packaging.com\nhttps://another-company.co.kr'}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={runNow}
                onChange={(e) => setRunNow(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f]"
              />
              <span className="text-sm text-slate-700">즉시 실행</span>
            </label>

            <button
              type="submit"
              disabled={submitting || !urlInput.trim()}
              className="bg-[#1e3a5f] text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-[#162d4a] disabled:opacity-50 transition-colors"
            >
              {submitting ? '처리 중...' : runNow ? '등록 후 즉시 실행' : '큐에 등록'}
            </button>
          </div>
        </form>

        {submitResult && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm ${
            submitResult.startsWith('오류') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {submitResult}
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            최근 크롤링 작업
          </h2>
          <span className="text-xs text-slate-400">{jobs.length}개</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-6 py-3 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">불러오는 중...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">등록된 크롤링 작업이 없습니다</p>
            <p className="text-slate-400 text-xs mt-1">위 폼에서 URL을 등록하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">URL</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">업체 연결</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">등록일</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 max-w-xs">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1e3a5f] hover:underline font-mono text-xs truncate block"
                        title={job.url}
                      >
                        {job.url.replace(/^https?:\/\//, '')}
                      </a>
                      {job.error && (
                        <p className="text-xs text-red-500 mt-0.5 truncate" title={job.error}>
                          {job.error}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[job.status]}`}>
                        {STATUS_LABELS[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {job.company_id ? (
                        <span className="text-emerald-600">연결됨</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(job.created_at).toLocaleString('ko-KR', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {(job.status === 'pending' || job.status === 'failed') && (
                        <button
                          onClick={() => runJob(job.id)}
                          className="text-xs font-medium text-[#1e3a5f] hover:underline"
                        >
                          재실행
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
