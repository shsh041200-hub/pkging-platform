import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONCURRENCY = 10;
const TIMEOUT_MS = 10000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

async function fetchWithTimeout(url, opts) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function checkUrl(url) {
  try {
    // Try HEAD first
    const headRes = await fetchWithTimeout(url, {
      method: 'HEAD',
      headers: { 'User-Agent': BROWSER_UA },
    });
    // Any HTTP response (even 403/405) means the server is alive
    if (headRes.ok || headRes.status === 403 || headRes.status === 405) {
      return { ok: true, status: headRes.status };
    }
    // For 404 or other errors, retry with GET to confirm
    const getRes = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'User-Agent': BROWSER_UA },
    });
    // Any HTTP response from GET means the server is at least running
    if (getRes.status < 500) {
      return { ok: true, status: getRes.status };
    }
    return { ok: false, status: getRes.status };
  } catch (err) {
    // Network-level failure: try GET as final fallback
    try {
      const getRes = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { 'User-Agent': BROWSER_UA },
      });
      return { ok: getRes.status < 500, status: getRes.status };
    } catch (err2) {
      if (err2.code === 'ERR_INVALID_URL') return { ok: false, status: 'invalid_url' };
      if (err2.name === 'AbortError') return { ok: false, status: 'timeout' };
      return { ok: false, status: err2.code || err2.message };
    }
  }
}

async function processBatch(companies, results) {
  const promises = companies.map(async (c) => {
    const result = await checkUrl(c.website);
    results.push({ ...c, ...result });
    const icon = result.ok ? 'OK' : 'FAIL';
    process.stdout.write(`  [${icon}] ${c.name} | ${c.website} | ${result.status}\n`);
  });
  await Promise.all(promises);
}

async function main() {
  const dryRun = !process.argv.includes('--execute');

  const { data: companies, error } = await client
    .from('companies')
    .select('id, slug, name, website')
    .order('name');

  if (error) { console.error('Error:', error); process.exit(1); }

  const noWebsite = companies.filter(c => !c.website);
  const withWebsite = companies.filter(c => c.website);

  console.log(`Total companies: ${companies.length}`);
  console.log(`Without website (will delete): ${noWebsite.length}`);
  console.log(`With website (will validate): ${withWebsite.length}\n`);

  if (noWebsite.length > 0) {
    console.log('=== NO WEBSITE ===');
    noWebsite.forEach(c => console.log(`  - ${c.name}`));
  }

  console.log('\n=== VALIDATING URLs ===');
  const results = [];

  for (let i = 0; i < withWebsite.length; i += CONCURRENCY) {
    const batch = withWebsite.slice(i, i + CONCURRENCY);
    await processBatch(batch, results);
  }

  const dead = results.filter(r => !r.ok);
  const alive = results.filter(r => r.ok);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Reachable: ${alive.length}`);
  console.log(`Unreachable: ${dead.length}`);
  console.log(`No website: ${noWebsite.length}`);
  console.log(`Total to remove: ${dead.length + noWebsite.length}`);
  console.log(`Remaining after cleanup: ${alive.length}`);

  if (dead.length > 0) {
    console.log('\n=== UNREACHABLE WEBSITES ===');
    dead.forEach(c => console.log(`  - ${c.name} | ${c.website} | ${c.status}`));
  }

  if (!dryRun) {
    const idsToDelete = [
      ...noWebsite.map(c => c.id),
      ...dead.map(c => c.id),
    ];

    if (idsToDelete.length === 0) {
      console.log('\nNothing to delete.');
      return;
    }

    console.log(`\nDeleting ${idsToDelete.length} companies...`);
    const batchSize = 50;
    let deleted = 0;
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      const { error: delError } = await client
        .from('companies')
        .delete()
        .in('id', batch);
      if (delError) {
        console.error('Batch delete error:', delError);
      } else {
        deleted += batch.length;
      }
    }

    console.log(`Deleted ${deleted} companies.`);

    const { count } = await client
      .from('companies')
      .select('*', { count: 'exact', head: true });
    console.log(`Remaining companies: ${count}`);
  } else {
    console.log('\n--- DRY RUN (pass --execute to delete) ---');
  }
}

main().catch(console.error);
