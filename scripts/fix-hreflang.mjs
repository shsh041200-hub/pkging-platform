/**
 * React 19 / Next.js 15 serializes the `hreflang` HTML attribute as `hrefLang`
 * (camelCase DOM property name) in SSG-rendered HTML.  Googlebot and Naver Bot
 * parse raw server HTML — they treat `hrefLang` as an unknown attribute and
 * ignore it.  This script runs after `next build` and rewrites every occurrence
 * in the pre-rendered HTML files inside .next/server/app/.
 *
 * Only the .html files matter for search-engine crawlers; .rsc files are
 * consumed by the React client router, not by bots.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverAppDir = path.join(__dirname, '..', '.next', 'server', 'app');

function walkHtml(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      walkHtml(fullPath, results);
    } else if (entry.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

let patched = 0;
for (const fullPath of walkHtml(serverAppDir)) {
  const original = readFileSync(fullPath, 'utf8');
  const fixed = original.replaceAll('hrefLang=', 'hreflang=');
  if (fixed !== original) {
    writeFileSync(fullPath, fixed, 'utf8');
    patched++;
    console.log(`  patched ${path.relative(serverAppDir, fullPath)}`);
  }
}
console.log(`fix-hreflang: ${patched} file(s) patched.`);
