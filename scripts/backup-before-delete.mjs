import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TIMEOUT_MS = 8000;
const CONCURRENCY = 10;

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BoxterBot/1.0)' },
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    if (err.code === 'ERR_INVALID_URL') return { ok: false, status: 'invalid_url' };
    if (err.name === 'AbortError') return { ok: false, status: 'timeout' };
    return { ok: false, status: err.code || err.message };
  }
}

async function main() {
  const { data: companies, error } = await client
    .from('companies')
    .select('*')
    .order('name');

  if (error) { console.error('Error:', error); process.exit(1); }

  const noWebsite = companies.filter(c => !c.website);
  const withWebsite = companies.filter(c => c.website);

  const urlResults = [];
  for (let i = 0; i < withWebsite.length; i += CONCURRENCY) {
    const batch = withWebsite.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (c) => {
      const result = await checkUrl(c.website);
      urlResults.push({ ...c, urlStatus: result.status, urlOk: result.ok });
    }));
    process.stdout.write(`  Checked ${Math.min(i + CONCURRENCY, withWebsite.length)}/${withWebsite.length}\r`);
  }

  const toDelete = [
    ...noWebsite.map(c => ({ ...c, deleteReason: 'no_website', urlStatus: null, urlOk: false })),
    ...urlResults.filter(r => !r.urlOk).map(c => ({ ...c, deleteReason: 'url_unreachable' })),
  ];

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scripts/backup-deleted-companies-${timestamp}.json`;

  writeFileSync(filename, JSON.stringify(toDelete, null, 2));
  console.log(`\nBackup saved: ${filename}`);
  console.log(`Companies to delete: ${toDelete.length}`);
  console.log(`  - No website: ${noWebsite.length}`);
  console.log(`  - Unreachable URL: ${urlResults.filter(r => !r.urlOk).length}`);
}

main().catch(console.error);
