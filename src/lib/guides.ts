import { INDUSTRY_CATEGORIES, type IndustryCategory } from '@/types'
import { createClient } from '@/lib/supabase/server'

export interface GuideCategoryCount {
  category: IndustryCategory
  count: number
}

/**
 * Returns the ordered list of categories that have at least one published guide,
 * with per-category counts. Both the main guides list and category detail pages
 * use this to render consistent nav chips.
 */
export async function getActiveGuideCategories(): Promise<GuideCategoryCount[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .not('category', 'is', null)

  if (!data) return []

  const counts = new Map<IndustryCategory, number>()
  for (const row of data) {
    const cat = row.category as IndustryCategory
    if (INDUSTRY_CATEGORIES.includes(cat)) {
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
  }

  return INDUSTRY_CATEGORIES
    .filter((cat) => (counts.get(cat) ?? 0) > 0)
    .map((cat) => ({ category: cat, count: counts.get(cat)! }))
}
