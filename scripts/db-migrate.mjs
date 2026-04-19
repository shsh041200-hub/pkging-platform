#!/usr/bin/env node
/**
 * Supabase 마이그레이션 자동 적용 스크립트
 *
 * 사용법:
 *   node scripts/db-migrate.mjs
 *
 * 필요한 환경변수 (.env.local):
 *   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens 에서 발급
 *   SUPABASE_PROJECT_REF   — Supabase 프로젝트 ref (URL에서 확인, 기본값 내장)
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// .env.local 파싱 (dotenv 없이)
try {
  const env = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* .env.local 없으면 무시 */ }

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'jnrciibwtutzymkoepfp'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN이 없습니다.')
  console.error('   .env.local에 SUPABASE_ACCESS_TOKEN=<token> 추가하세요.')
  console.error('   토큰 발급: https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

/**
 * SQL 파일을 개별 구문으로 분리 (문자열 리터럴 내 세미콜론 무시)
 * ALTER TYPE ADD VALUE → INSERT 순서 보장을 위해 구문별 별도 트랜잭션으로 실행
 */
function splitStatements(sql) {
  const statements = []
  let current = ''
  let inString = false
  let stringChar = ''
  let i = 0

  while (i < sql.length) {
    const ch = sql[i]
    // 문자열 리터럴 추적 (단순 single-quote)
    if (!inString && ch === "'") {
      inString = true
      stringChar = "'"
      current += ch
    } else if (inString && ch === stringChar) {
      // escape: ''
      if (sql[i + 1] === stringChar) {
        current += ch + sql[i + 1]
        i += 2
        continue
      }
      inString = false
      current += ch
    } else if (!inString && ch === ';') {
      const stmt = current.trim()
      if (stmt) statements.push(stmt)
      current = ''
    } else {
      current += ch
    }
    i++
  }
  const last = current.trim()
  if (last) statements.push(last)
  return statements.filter((s) => s.replace(/--[^\n]*/g, '').trim())
}

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }
  return res.json()
}

async function main() {
  // 적용 기록 테이블 (없으면 생성)
  await runSQL(`
    CREATE TABLE IF NOT EXISTS _applied_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const rows = await runSQL('SELECT filename FROM _applied_migrations ORDER BY filename')
  const applied = new Set(rows.map((r) => r.filename))

  const migrationsDir = join(PROJECT_ROOT, 'supabase', 'migrations')
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

  let count = 0
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`⏭️  skip  ${file}`)
      continue
    }
    process.stdout.write(`⚙️  apply ${file} ... `)
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    // ALTER TYPE ADD VALUE는 같은 트랜잭션에서 사용 불가 — 구문별 분리 실행
    const statements = splitStatements(sql)
    for (const stmt of statements) {
      await runSQL(stmt)
    }
    await runSQL(`INSERT INTO _applied_migrations (filename) VALUES ('${file.replace(/'/g, "''")}')`)
    console.log('✅')
    count++
  }

  if (count === 0) {
    console.log('✅ 모든 마이그레이션이 이미 적용되어 있습니다.')
  } else {
    console.log(`\n✅ ${count}개 마이그레이션 적용 완료`)
  }
}

main().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
