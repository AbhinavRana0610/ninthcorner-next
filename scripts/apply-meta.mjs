// Writes the reviewed meta titles/descriptions from content/seo-meta/meta.json into
// content/pages/*.json (<title>, meta description, og:* and twitter:* copies).
//
//   node scripts/apply-meta.mjs            apply + report
//   node scripts/apply-meta.mjs --report   report only
//
// meta.json is generated from ninthcorner-meta-review-v2.xlsx (point 7 + 15). Idempotent:
// re-run it after `npm run legacy:extract`.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/seo-meta/meta.json'), 'utf8'));
const reportOnly = process.argv.includes('--report');

let changed = 0;
let missing = 0;
for (const [file, { title, description }] of Object.entries(META)) {
  const p = path.join(PAGES_DIR, `${file}.json`);
  if (!fs.existsSync(p)) {
    console.warn(`missing page: ${file}`);
    missing++;
    continue;
  }
  const page = JSON.parse(fs.readFileSync(p, 'utf8'));
  const m = page.meta;
  const before = JSON.stringify(m);
  m.title = title;
  m.description = description;
  for (const k of ['og', 'twitter']) {
    if (m[k]?.title !== undefined) m[k].title = title;
    if (m[k]?.description !== undefined) m[k].description = description;
  }
  if (JSON.stringify(m) === before) continue;
  changed++;
  if (!reportOnly) fs.writeFileSync(p, JSON.stringify(page));
}
console.log(`${reportOnly ? 'would change' : 'changed'} ${changed} pages, ${missing} missing`);
