import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const dryRun = !process.argv.includes('--execute');

  console.log('=== Address & Email Cleanup ===\n');

  const { data: withAddress, error: e1 } = await client
    .from('companies')
    .select('id, name, address')
    .not('address', 'is', null);

  const { data: withEmail, error: e2 } = await client
    .from('companies')
    .select('id, name, email')
    .not('email', 'is', null);

  if (e1 || e2) {
    console.error('Query error:', e1 || e2);
    process.exit(1);
  }

  console.log(`Companies with address data: ${withAddress.length}`);
  console.log(`Companies with email data: ${withEmail.length}`);

  if (!dryRun) {
    console.log('\nNulling out address field...');
    const { error: addrErr } = await client
      .from('companies')
      .update({ address: null })
      .not('address', 'is', null);
    if (addrErr) console.error('Address cleanup error:', addrErr);
    else console.log(`  Cleared address for ${withAddress.length} companies`);

    console.log('Nulling out email field...');
    const { error: emailErr } = await client
      .from('companies')
      .update({ email: null })
      .not('email', 'is', null);
    if (emailErr) console.error('Email cleanup error:', emailErr);
    else console.log(`  Cleared email for ${withEmail.length} companies`);

    console.log('\nDone.');
  } else {
    console.log('\n--- DRY RUN (pass --execute to apply) ---');
  }
}

main().catch(console.error);
