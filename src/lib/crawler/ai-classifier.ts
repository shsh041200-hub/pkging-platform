import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { type IndustryCategory, INDUSTRY_CATEGORIES } from '@/types'
import type { IndustryClassificationResult } from './classifier'

const AI_DAILY_LIMIT = parseInt(process.env.AI_CLASSIFY_DAILY_LIMIT ?? '100', 10)

const SYSTEM_PROMPT = `당신은 한국 패키징(포장) 업체를 산업 카테고리로 분류하는 전문가입니다.
아래 회사 정보를 읽고, 해당하는 산업 카테고리를 모두 선택하세요.

카테고리 목록:
- food-beverage: 식품·음료 포장
- ecommerce-shipping: 이커머스·배송 포장
- cosmetics-beauty: 화장품·뷰티 포장
- pharma-health: 의약·건강 포장
- electronics-industrial: 전자·산업 포장

JSON으로만 응답하세요: { "categories": ["category-id", ...], "confidence": 0.0-1.0 }
해당 카테고리가 확실하지 않으면 빈 배열 반환. confidence는 분류 확신도.`

async function checkDailyBudget(): Promise<boolean> {
  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await db
    .from('crawl_ai_usage')
    .select('call_count')
    .eq('usage_date', today)
    .maybeSingle()
  return (data?.call_count ?? 0) < AI_DAILY_LIMIT
}

async function recordUsage(inputTokens: number, outputTokens: number): Promise<void> {
  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await db
    .from('crawl_ai_usage')
    .select('id, call_count, input_tokens, output_tokens')
    .eq('usage_date', today)
    .maybeSingle()

  if (existing) {
    await db
      .from('crawl_ai_usage')
      .update({
        call_count: existing.call_count + 1,
        input_tokens: existing.input_tokens + inputTokens,
        output_tokens: existing.output_tokens + outputTokens,
      })
      .eq('id', existing.id)
  } else {
    await db
      .from('crawl_ai_usage')
      .insert({
        usage_date: today,
        call_count: 1,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      })
  }
}

export async function classifyWithAI(companyText: string): Promise<IndustryClassificationResult> {
  const withinBudget = await checkDailyBudget()
  if (!withinBudget) {
    return { categories: [], confidence: 0, method: 'none' }
  }

  const truncated = companyText.slice(0, 2000)

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: truncated }],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    await recordUsage(
      response.usage?.input_tokens ?? 0,
      response.usage?.output_tokens ?? 0,
    )

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { categories: [], confidence: 0, method: 'ai' }
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validCategories = (parsed.categories ?? [])
      .filter((c: string) => INDUSTRY_CATEGORIES.includes(c as IndustryCategory)) as IndustryCategory[]
    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5

    return { categories: validCategories, confidence, method: 'ai' }
  } catch {
    return { categories: [], confidence: 0, method: 'none' }
  }
}
