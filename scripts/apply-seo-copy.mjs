// Injects the SEO copy in content/seo-copy/<key>.html into content/pages/<key>.json and
// reports each page's word count and primary-keyword density.
//
//   node scripts/apply-seo-copy.mjs            apply + report
//   node scripts/apply-seo-copy.mjs --report   report only
//
// Idempotent: the copy sits between <!-- seo-copy:start --> / <!-- seo-copy:end --> markers
// and is replaced on every run, so re-run it after `npm run legacy:extract`.
// content/seo-copy/pages.json maps page key -> { keyword, anchor? }. The copy goes right
// before `anchor` when given, otherwise at the end of the page body.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const COPY_DIR = path.join(ROOT, 'content/seo-copy');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const START = '<!-- seo-copy:start -->';
const END = '<!-- seo-copy:end -->';
const reportOnly = process.argv.includes('--report');

const config = JSON.parse(fs.readFileSync(path.join(COPY_DIR, 'pages.json'), 'utf8'));

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const countWords = (text) => text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const countPhrase = (text, phrase) =>
  (text.toLowerCase().match(new RegExp(`(?<![\\p{L}\\p{N}])${phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'gu')) ?? []).length;

const rows = [];
for (const [key, { keyword, anchor }] of Object.entries(config)) {
  const pageFile = path.join(PAGES_DIR, `${key}.json`);
  const page = JSON.parse(fs.readFileSync(pageFile, 'utf8'));
  let html = page.html;

  if (!reportOnly) {
    const copyFile = path.join(COPY_DIR, `${key}.html`);
    if (!fs.existsSync(copyFile)) {
      rows.push({ key, error: 'no copy file' });
      continue;
    }
    const block = `${START}\n${fs.readFileSync(copyFile, 'utf8').trim()}\n${END}\n`;
    const s = html.indexOf(START);
    if (s !== -1) {
      const e = html.indexOf(END, s) + END.length;
      html = html.slice(0, s) + block.trimEnd() + html.slice(e);
    } else if (anchor) {
      if (html.split(anchor).length !== 2) throw new Error(`${key}: anchor must occur exactly once: ${anchor}`);
      html = html.replace(anchor, block + anchor);
    } else {
      html = html.trimEnd() + '\n' + block;
    }
    if (html !== page.html) {
      page.html = html;
      fs.writeFileSync(pageFile, JSON.stringify(page));
    }
  }

  const text = visibleText(html);
  const words = countWords(text);
  const hits = countPhrase(text, keyword);
  rows.push({ key, keyword, words, hits, density: +((hits / words) * 100).toFixed(2) });
}

console.log('key'.padEnd(64), 'words', 'kw', 'per100', ' keyword');
for (const r of rows) {
  if (r.error) {
    console.log(r.key.padEnd(64), r.error);
    continue;
  }
  const flag = (r.words < 900 || r.words > 1000 ? 'W' : ' ') + (r.density < 1 || r.density > 2 ? 'D' : ' ');
  console.log(r.key.padEnd(64), String(r.words).padStart(5), String(r.hits).padStart(3), String(r.density).padStart(6), flag, r.keyword);
}
