#!/usr/bin/env -S npx tsx
/**
 * Normalize companies.certifications from raw freetext strings to canonical IDs.
 *
 * Strategy: rule-based alias mapping (CERTIFICATION_TYPES) first.
 * Unknown values are logged for manual review rather than discarded.
 *
 * Usage:
 *   npx tsx scripts/normalize-certifications.ts [--dry-run]
 *
 * Required env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { CERTIFICATION_TYPES } from '../src/types/index'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

try {
  const env = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* ignore missing .env.local */ }

const DRY_RUN = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Build alias → canonical ID lookup (case-insensitive, trimmed)
const aliasMap = new Map<string, string>()
for (const cert of CERTIFICATION_TYPES) {
  aliasMap.set(cert.id.toLowerCase(), cert.id)
  for (const alias of cert.aliases) {
    aliasMap.set(alias.toLowerCase().trim(), cert.id)
  }
}

function normalize(raw: string): string | null {
  const key = raw.toLowerCase().trim()
  return aliasMap.get(key) ?? null
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)

  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, certifications')
    .not('certifications', 'eq', '{}')

  if (error) {
    console.error('Failed to fetch companies:', error.message)
    process.exit(1)
  }

  console.log(`Processing ${companies.length} companies with certifications…\n`)

  let updatedCount = 0
  const unmapped = new Set<string>()

  for (const company of companies) {
    const raw: string[] = company.certifications ?? []
    if (raw.length === 0) continue

    const canonical: string[] = []
    let changed = false

    for (const entry of raw) {
      const id = normalize(entry)
      if (id) {
        if (!canonical.includes(id)) canonical.push(id)
        if (id !== entry) changed = true
      } else {
        // Already a canonical ID or completely unknown
        const alreadyCanonical = CERTIFICATION_TYPES.some(c => c.id === entry)
        if (alreadyCanonical) {
          if (!canonical.includes(entry)) canonical.push(entry)
        } else {
          unmapped.add(entry)
          // Preserve unmapped value as-is to avoid data loss
          if (!canonical.includes(entry)) canonical.push(entry)
        }
      }
    }

    if (!changed) continue

    console.log(`  ${company.name}: ${JSON.stringify(raw)} → ${JSON.stringify(canonical)}`)

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ certifications: canonical })
        .eq('id', company.id)

      if (updateError) {
        console.error(`  ERROR updating ${company.name}:`, updateError.message)
        continue
      }
    }

    updatedCount++
  }

  console.log(`\nUpdated: ${updatedCount} companies${DRY_RUN ? ' (dry run — no writes)' : ''}`)

  if (unmapped.size > 0) {
    console.log('\nUnmapped certification strings (manual review needed):')
    for (const v of unmapped) console.log(`  - "${v}"`)
  }
}

main()
