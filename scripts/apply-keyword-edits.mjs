// Applies the keyword-density edits in content/keyword-edits/<city>.json to the matching
// content/pages/<city>__<page>.json files.
//
//   node scripts/apply-keyword-edits.mjs gurgaon            apply
//   node scripts/apply-keyword-edits.mjs gurgaon --check    report only
//
// Each edit is [old fragment, new fragment] of page HTML. Matching ignores differences in
// whitespace and in how "&" / apostrophes are encoded. The old fragment must occur exactly
// once in the visible page; copies inside <script> blocks (the FAQ JSON-LD) are changed
// too, so the schema keeps matching the page. Idempotent: an edit whose new fragment is
// already present is skipped, so re-run it after `npm run legacy:extract`.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const city = process.argv[2];
const checkOnly = process.argv.includes('--check');
if (!city) throw new Error('usage: node scripts/apply-keyword-edits.mjs <city> [--check]');

const edits = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/keyword-edits', `${city}.json`), 'utf8'));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function pattern(fragment) {
  const src = fragment
    .split(/\s+/)
    .map((w) => esc(w).replace(/&/g, '(?:&|&amp;)').replace(/[’']/g, "(?:'|’|&rsquo;|&#39;)"))
    .join('\\s+');
  return new RegExp(src, 'g');
}

let failed = 0;
for (const [page, list] of Object.entries(edits)) {
  if (page.startsWith('_')) continue;
  const file = path.join(ROOT, 'content/pages', `${city}__${page}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let html = data.html;
  let applied = 0, skipped = 0;
  for (const [from, to] of list) {
    if (pattern(to).test(html)) { skipped++; continue; }
    const re = pattern(from);
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    const hits = visible.match(re)?.length ?? 0;
    if (hits !== 1) {
      console.error(`  ✗ ${page}: expected 1 match, found ${hits}: "${from.slice(0, 70)}"`);
      failed++;
      continue;
    }
    // Odd parts are <script> blocks: there the new text goes in without tags, JSON-escaped.
    const inPage = to.replace(/\$/g, '$$$$');
    const inScript = JSON.stringify(to.replace(/<[^>]+>/g, '')).slice(1, -1).replace(/\$/g, '$$$$');
    const reScript = pattern(from.replace(/<[^>]+>/g, ''));
    html = html
      .split(/(<script[\s\S]*?<\/script>)/i)
      .map((part, i) => (i % 2 ? part.replace(reScript, inScript) : part.replace(re, inPage)))
      .join('');
    applied++;
  }
  if (!checkOnly && html !== data.html) {
    data.html = html;
    fs.writeFileSync(file, JSON.stringify(data));
  }
  console.log(`${checkOnly ? 'would apply' : 'applied'} ${applied}, already done ${skipped}  ${page}`);
}
if (failed) {
  console.error(`${failed} edit(s) did not match`);
  process.exit(1);
}
