// Apply all SQL files in supabase/migrations/ to Supabase via the Management API.
// Migrations use IF NOT EXISTS / ON CONFLICT patterns — safe to re-run.
//
// Usage: node scripts/db-migrate.mjs
// Requires: SUPABASE_ACCESS_TOKEN in .env.local
// Get a token at: https://supabase.com/dashboard/account/tokens

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    return Object.fromEntries(
      raw
        .split("\n")
        .map((l) => l.match(/^([^#=\s][^=]*)=(.*)$/))
        .filter(Boolean)
        .map((m) => [m[1].trim(), m[2].trim()])
    );
  } catch {
    console.error("ERROR: .env.local not found — copy .env.local.example and fill in values.");
    process.exit(1);
  }
}

const env = loadEnv();
const accessToken = env.SUPABASE_ACCESS_TOKEN;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

if (!accessToken) {
  console.error("ERROR: SUPABASE_ACCESS_TOKEN missing in .env.local");
  console.error("       Get one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}
if (!supabaseUrl || supabaseUrl.includes("your-project")) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL not set in .env.local");
  process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];

const migrationsDir = join(root, "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("No migration files found.");
  process.exit(0);
}

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  process.stdout.write(`Applying ${file} ... `);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`FAILED\n${res.status}: ${body}`);
    process.exit(1);
  }

  console.log("done");
}

console.log(`\n${files.length} migration(s) applied.`);
