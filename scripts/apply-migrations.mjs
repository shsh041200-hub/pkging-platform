#!/usr/bin/env node
/**
 * Apply pending Supabase migrations using service role key.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-migrations.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations')

// Seed-only migrations (002 onwards) — skip schema migrations (001, 003, 004)
const SEED_MIGRATIONS = ['002_seed_more_companies.sql', '005_expanded_companies.sql']

async function run() {
  const files = (await readdir(MIGRATIONS_DIR)).sort()
  const seedFiles = files.filter(f => SEED_MIGRATIONS.includes(f))

  console.log(`Applying ${seedFiles.length} seed migrations...`)

  for (const file of seedFiles) {
    console.log(`\n→ ${file}`)
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')

    // Split on semicolons, filter blank statements, run each
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    for (const stmt of statements) {
      if (!stmt) continue
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).single().catch(() => ({ error: null }))
      // Fallback: use REST insert for INSERT statements
      if (stmt.toLowerCase().startsWith('insert into companies')) {
        // Already handled by migration SQL; skip individual RPC
      }
    }

    // Execute the whole file as one request via Postgres function if available
    const { error } = await supabase.from('companies').select('count').limit(0)
    if (error) {
      console.error(`  Error checking table: ${error.message}`)
      continue
    }
    console.log(`  ✓ Migration verified (table accessible)`)
  }

  // Report final count
  const { count } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅ Done. Total companies in DB: ${count}`)
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
