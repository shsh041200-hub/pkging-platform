import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Third-party platforms/directories — not a company's own website
const THIRD_PARTY_DOMAINS = [
  'soomgo.com',           // 숨고 - freelancer marketplace (explicit example from issue)
  'ifactoryhub.com',      // 아이팩토리허브 - factory directory aggregator
  'exhi.daara.co.kr',     // 다아라 - exhibition directory
  'ko.ecer.com',          // ecer.com - global B2B marketplace
  'allpackagingmall.com', // 올패키징몰 - packaging mall (vendor storefronts)
  'kopack.re.kr',         // 한국포장기술원 - research institute pages, not companies
];

function isThirdPartyWebsite(website) {
  if (!website) return false;
  return THIRD_PARTY_DOMAINS.some(d => website.includes(d));
}

async function main() {
  const dryRun = !process.argv.includes('--execute');

  const { data: companies, error } = await client
    .from('companies')
    .select('id, slug, name, website')
    .order('name');

  if (error) { console.error('Error:', error); process.exit(1); }

  const toRemove = [];

  for (const c of companies) {
    if (!c.website) {
      toRemove.push({ ...c, reason: 'no_website' });
    } else if (isThirdPartyWebsite(c.website)) {
      const domain = THIRD_PARTY_DOMAINS.find(d => c.website.includes(d));
      toRemove.push({ ...c, reason: `third_party: ${domain}` });
    }
  }

  console.log(`\nTotal companies: ${companies.length}`);
  console.log(`Flagged for removal: ${toRemove.length}`);
  console.log(`Remaining after filter: ${companies.length - toRemove.length}\n`);

  const byReason = {};
  for (const c of toRemove) {
    const key = c.reason.startsWith('no_website') ? 'no_website' : c.reason;
    if (!byReason[key]) byReason[key] = [];
    byReason[key].push(c);
  }

  for (const [reason, items] of Object.entries(byReason)) {
    console.log(`\n=== ${reason.toUpperCase()} (${items.length}) ===`);
    for (const c of items) {
      console.log(`  - ${c.name} | ${c.website || 'none'}`);
    }
  }

  if (!dryRun) {
    const ids = toRemove.map(c => c.id);
    console.log(`\nDeleting ${ids.length} companies...`);

    const batchSize = 50;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const { error: delError } = await client
        .from('companies')
        .delete()
        .in('id', batch);
      if (delError) {
        console.error(`Batch delete error:`, delError);
      } else {
        deleted += batch.length;
        console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} companies`);
      }
    }

    console.log(`\nDone. Deleted ${deleted} companies.`);

    const { count } = await client
      .from('companies')
      .select('*', { count: 'exact', head: true });
    console.log(`Remaining companies: ${count}`);
  } else {
    console.log('\n--- DRY RUN (pass --execute to delete) ---');
  }
}

main().catch(console.error);
