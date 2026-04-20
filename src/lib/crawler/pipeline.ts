import { createServiceClient } from '@/lib/supabase/service'
import { fetchHtml } from './fetcher'
import { extractCompanyInfo } from './extractor'
import { classifyCompany, isPackagingRelevant, isCompanyHomepage, extractHomepage } from './classifier'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export interface PipelineResult {
  jobId: string
  status: 'done' | 'failed' | 'skipped'
  companyId?: string
  error?: string
}

export async function runCrawlJob(jobId: string): Promise<PipelineResult> {
  const db = createServiceClient()

  // Mark job running
  await db
    .from('crawl_jobs')
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq('id', jobId)

  const { data: job } = await db
    .from('crawl_jobs')
    .select('url')
    .eq('id', jobId)
    .single()

  if (!job) {
    return { jobId, status: 'failed', error: 'Job not found' }
  }

  // 1. Skip known non-homepage URL patterns at the job level before fetching
  const jobUrl = job.url
  if (!isCompanyHomepage(jobUrl)) {
    const homepage = extractHomepage(jobUrl)
    await db
      .from('crawl_jobs')
      .update({ status: 'skipped', error: `product/blog page detected — use homepage: ${homepage}`, updated_at: new Date().toISOString() })
      .eq('id', jobId)
    return { jobId, status: 'skipped' }
  }

  // 2. Fetch
  const fetched = await fetchHtml(job.url)
  if (!fetched.ok) {
    await db
      .from('crawl_jobs')
      .update({ status: 'failed', error: fetched.error, updated_at: new Date().toISOString() })
      .eq('id', jobId)
    return { jobId, status: 'failed', error: fetched.error }
  }

  // 3. Extract
  const extracted = extractCompanyInfo(fetched.html, fetched.finalUrl)

  // 4. Relevance check — skip pages unrelated to packaging
  const fullText = [extracted.name, extracted.description, extracted.rawText]
    .filter(Boolean)
    .join(' ')

  if (!isPackagingRelevant(fullText)) {
    await db
      .from('crawl_jobs')
      .update({ status: 'skipped', error: 'not packaging related', updated_at: new Date().toISOString() })
      .eq('id', jobId)
    return { jobId, status: 'skipped' }
  }

  // 5. Classify
  const classification = classifyCompany(fullText)

  // 6. Build company record
  const name = extracted.name ?? new URL(fetched.finalUrl).hostname
  const slug = slugify(name)

  const companyData = {
    name,
    slug,
    category: classification.category,
    subcategory: classification.subcategory,
    description: extracted.description,
    phone: extracted.phone,
    email: extracted.email,
    address: extracted.address,
    city: extracted.city,
    province: extracted.province,
    website: extracted.website,
    products: extracted.products,
    certifications: extracted.certifications,
    is_verified: false,
    updated_at: new Date().toISOString(),
  }

  // 7. Upsert to companies (by slug)
  const { data: existing } = await db
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  let companyId: string

  if (existing) {
    const { error } = await db
      .from('companies')
      .update(companyData)
      .eq('id', existing.id)
    if (error) {
      await db
        .from('crawl_jobs')
        .update({ status: 'failed', error: error.message, updated_at: new Date().toISOString() })
        .eq('id', jobId)
      return { jobId, status: 'failed', error: error.message }
    }
    companyId = existing.id
  } else {
    const { data: inserted, error } = await db
      .from('companies')
      .insert({ ...companyData, created_at: new Date().toISOString() })
      .select('id')
      .single()
    if (error || !inserted) {
      const msg = error?.message ?? 'Insert failed'
      await db
        .from('crawl_jobs')
        .update({ status: 'failed', error: msg, updated_at: new Date().toISOString() })
        .eq('id', jobId)
      return { jobId, status: 'failed', error: msg }
    }
    companyId = inserted.id
  }

  // 8. Mark job done
  await db
    .from('crawl_jobs')
    .update({
      status: 'done',
      company_id: companyId,
      extracted: extracted as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  return { jobId, status: 'done', companyId }
}

export async function enqueueCrawlJobs(urls: string[]): Promise<string[]> {
  const db = createServiceClient()

  const rows = urls.map((url) => ({ url, status: 'pending' as const }))
  const { data, error } = await db
    .from('crawl_jobs')
    .insert(rows)
    .select('id')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r: { id: string }) => r.id)
}
