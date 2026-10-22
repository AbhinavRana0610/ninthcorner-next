// Applies the find/replace rules in content/content-fixes.json to content/pages/*.json
// (page HTML, JSON-LD blocks and every string in meta).
//
//   node scripts/apply-content-fixes.mjs            apply + report
//   node scripts/apply-content-fixes.mjs --report   report only
//
// Idempotent: a rule's replacement never matches its own pattern, so re-run it after
// `npm run legacy:extract` (before apply-keyword-edits.mjs, whose fragments use the fixed text).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const { rules } = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/content-fixes.json'), 'utf8'));
const reportOnly = process.argv.includes('--report');

const compiled = rules.map((r) => ({ ...r, pagesRe: new RegExp(r.pages), findRe: new RegExp(r.find, 'gi') }));

function fixStrings(value, rule, count) {
  if (typeof value === 'string') {
    return value.replace(rule.findRe, (...m) => {
      count.n++;
      return rule.replace.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '');
    });
  }
  if (Array.isArray(value)) return value.map((v) => fixStrings(v, rule, count));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fixStrings(v, rule, count)]));
  }
  return value;
}

const perRule = compiled.map(() => 0);
let pagesChanged = 0;
for (const file of fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))) {
  const key = file.slice(0, -5);
  const full = path.join(PAGES_DIR, file);
  let page = JSON.parse(fs.readFileSync(full, 'utf8'));
  let changed = false;
  compiled.forEach((rule, i) => {
    if (!rule.pagesRe.test(key)) return;
    const count = { n: 0 };
    page = {
      ...page,
      html: fixStrings(page.html, rule, count),
      jsonLd: fixStrings(page.jsonLd, rule, count),
      meta: fixStrings(page.meta, rule, count),
    };
    perRule[i] += count.n;
    if (count.n) changed = true;
  });
  if (!changed) continue;
  pagesChanged++;
  if (!reportOnly) fs.writeFileSync(full, JSON.stringify(page));
}
compiled.forEach((r, i) => console.log(`${String(perRule[i]).padStart(4)}  ${r.pages}  ${r.find}`));
console.log(`${reportOnly ? 'would change' : 'changed'} ${pagesChanged} pages`);
