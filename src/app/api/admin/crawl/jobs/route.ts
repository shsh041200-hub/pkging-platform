import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runCrawlJob } from '@/lib/crawler/pipeline'

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

// POST /api/admin/crawl/jobs — run a specific pending job
// Body: { jobId: string }
export async function POST(request: NextRequest) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { jobId } = await request.json()
  if (!jobId) return NextResponse.json({ error: 'jobId 필요' }, { status: 400 })

  const db = createServiceClient()
  const { data: job } = await db
    .from('crawl_jobs')
    .select('id, status')
    .eq('id', jobId)
    .single()

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  if (job.status === 'running') {
    return NextResponse.json({ error: 'Job already running' }, { status: 409 })
  }
  if (job.status === 'done') {
    return NextResponse.json({ error: 'Job already done' }, { status: 409 })
  }

  const result = await runCrawlJob(jobId)
  return NextResponse.json(result)
}
