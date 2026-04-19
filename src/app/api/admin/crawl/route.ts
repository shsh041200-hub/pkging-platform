import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { enqueueCrawlJobs, runCrawlJob } from '@/lib/crawler/pipeline'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

// GET /api/admin/crawl — list recent crawl jobs
export async function GET() {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('crawl_jobs')
    .select('id, url, status, company_id, error, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/admin/crawl — enqueue URLs and optionally run them immediately
// Body: { urls: string[], runNow?: boolean }
export async function POST(request: NextRequest) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { urls, runNow = false } = body as { urls: unknown; runNow?: boolean }

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: 'urls 배열이 필요합니다.' }, { status: 400 })
  }
  if (urls.length > 50) {
    return NextResponse.json({ error: '한 번에 최대 50개 URL까지 허용합니다.' }, { status: 400 })
  }

  const validUrls = urls.filter(
    (u): u is string => typeof u === 'string' && u.startsWith('http')
  )
  if (validUrls.length === 0) {
    return NextResponse.json({ error: '유효한 URL이 없습니다.' }, { status: 400 })
  }

  const jobIds = await enqueueCrawlJobs(validUrls)

  if (!runNow) {
    return NextResponse.json({ jobIds, queued: jobIds.length }, { status: 202 })
  }

  // Run jobs sequentially (fire-and-forget via streaming, or just await all)
  const results = await Promise.allSettled(jobIds.map((id) => runCrawlJob(id)))
  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { jobId: jobIds[i], status: 'failed', error: String(r.reason) }
  )

  return NextResponse.json({ results: summary })
}
