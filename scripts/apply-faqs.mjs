// Visible FAQ sections for service pages that had none (checklist point 20), from
// content/faqs/<city>.json (root.json = pages without a city prefix):
//   { "services-<slug>": [ { "q": "...", "a": "..." }, ... ] }
// The section goes at the end of the page's content container, in the same markup the Noida /
// Delhi / Gurgaon service pages use, plus the FAQ CSS if the page's <style> lacks it.
// Any FAQPage JSON-LD on a changed page is dropped, so run apply-schema.mjs afterwards: it
// rebuilds FAQPage from the visible section.
//
//   node scripts/apply-faqs.mjs            apply + report
//   node scripts/apply-faqs.mjs --report   report only
//
// Idempotent (the section sits between <!-- FAQS:auto --> markers and is replaced on re-run).
// Re-run after `npm run legacy:extract`, before apply-schema.mjs.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const FAQ_DIR = path.join(ROOT, 'content/faqs');
const reportOnly = process.argv.includes('--report');

const CSS = `
        /* --- FAQ Section --- */
        .faq-section { padding: 40px 0 20px; }
        .faq-section h2 { text-align: center; font-size: 36px; margin-bottom: 30px; color: var(--heading-color); }
        .faq-list { max-width: 900px; margin: 0 auto; }
        .faq-item { background: #ffffff; border-radius: var(--border-radius); padding: 24px; margin-bottom: 16px; box-shadow: var(--shadow-subtle); border: 1px solid #eee; }
        .faq-q { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading-color); margin-bottom: 10px; }
        .faq-a { font-size: 15px; color: var(--text-color); line-height: 1.6; margin: 0; }
        @media (max-width: 768px) { .faq-section h2 { font-size: 28px; } .faq-q { font-size: 18px; } .faq-item { padding: 18px; } }
`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const section = (items) =>
  `<!-- FAQS:auto -->
        <section class="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div class="faq-list">
${items
  .map(
    ({ q, a }) => `                <div class="faq-item">
                    <h3 class="faq-q">${esc(q)}</h3>
                    <p class="faq-a">${esc(a)}</p>
                </div>`,
  )
  .join('\n')}
            </div>
        </section>
        <!-- /FAQS:auto -->`;

const MARKED = /<!-- FAQS:auto -->[\s\S]*?<!-- \/FAQS:auto -->/;
let changed = 0;
const problems = [];
for (const file of fs.readdirSync(FAQ_DIR).filter((f) => f.endsWith('.json'))) {
  const city = file.replace('.json', '');
  const faqs = JSON.parse(fs.readFileSync(path.join(FAQ_DIR, file), 'utf8'));
  for (const [slug, items] of Object.entries(faqs)) {
    const pageFile = path.join(PAGES_DIR, `${city === 'root' ? '' : `${city}__`}${slug}.json`);
    if (!fs.existsSync(pageFile)) { problems.push(`missing page ${pageFile}`); continue; }
    const page = JSON.parse(fs.readFileSync(pageFile, 'utf8'));
    const before = JSON.stringify(page);
    const html = section(items);

    if (MARKED.test(page.html)) {
      page.html = page.html.replace(MARKED, html);
    } else if (/Frequently Asked Questions/i.test(page.html)) {
      problems.push(`${slug} (${city}) already has a FAQ section, skipped`);
      continue;
    } else {
      // end of the content container: the last </section> followed by the closing </div>
      const next = page.html.replace(/(<\/section>)(\s*<\/div>\s*)$/, `$1\n\n        ${html}$2`);
      if (next === page.html) { problems.push(`${slug} (${city}): insertion point not found`); continue; }
      page.html = next;
    }
    if (!page.html.includes('.faq-section')) page.html = page.html.replace('</style>', `${CSS}    </style>`);

    if (JSON.stringify(page) !== before) {
      page.jsonLd = page.jsonLd.filter((b) => !b.includes('"@type":"FAQPage"'));
      changed++;
      if (!reportOnly) fs.writeFileSync(pageFile, JSON.stringify(page));
    }
  }
}
console.log(`${reportOnly ? 'would update' : 'updated'} ${changed} pages`);
if (problems.length) console.log(problems.join('\n'));
