// Structured-data fixes for checklist point 20, applied to content/pages/*.json:
//   1. WebSite JSON-LD on every page (the homepage keeps its own inline block, updated below).
//   2. One brand name in schema: LocalBusiness/WebSite "name" = "9th Corner", with the old
//      spellings as alternateName.
//   3. FAQPage JSON-LD on pages that show a "Frequently Asked Questions" section but have no
//      FAQ schema. Questions and answers are read from the visible section, so the schema
//      always matches the page.
//   4. Service JSON-LD on every services-* page (the site's "product" is a service; no price).
//
//   node scripts/apply-schema.mjs            apply + report
//   node scripts/apply-schema.mjs --report   report only
//
// Idempotent; re-run it after `npm run legacy:extract` (last, after the other apply-* scripts,
// so the FAQ text matches the edited page).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const reportOnly = process.argv.includes('--report');

const SITE = 'https://www.ninthcorner.in/';
const BRAND = '9th Corner';
const ALT_NAMES = ['Ninth Corner', '9th-Corner'];
const WEBSITE = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}#website`,
  name: BRAND,
  alternateName: ALT_NAMES[0],
  url: SITE,
  publisher: { '@id': `${SITE}#organization` },
});

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&(rsquo|lsquo|#39);/g, "'")
    .replace(/&(rdquo|ldquo|quot);/g, '"')
    .replace(/&(ndash|mdash);/g, '-')
    .replace(/&eacute;/g, 'é')
    .replace(/\s+/g, ' ')
    .trim();

// Visible FAQ: the h2 "Frequently Asked Questions", then h3 question + p answer pairs until
// the next h2 or the end of the section.
function visibleFaq(html) {
  const start = html.search(/<h2[^>]*>\s*Frequently Asked Questions\s*<\/h2>/i);
  if (start < 0) return [];
  const rest = html.slice(start).replace(/^<h2[\s\S]*?<\/h2>/i, '');
  const end = rest.search(/<h2\b|<\/section>/i);
  const block = end < 0 ? rest : rest.slice(0, end);
  const out = [];
  const re = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*(?:<\/?div[^>]*>\s*)*<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  for (const m of block.matchAll(re)) {
    const q = decode(m[1]).replace(/^\d+\.\s*/, '');
    const a = decode(m[2]);
    if (q && a) out.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
  }
  return out;
}

const hasType = (page, type) =>
  [...page.jsonLd, ...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].some((b) =>
    (typeof b === 'string' ? b : b[1]).includes(`"@type":"${type}"`) ||
    (typeof b === 'string' ? b : b[1]).includes(`"@type": "${type}"`),
  );

const ROOT_AREAS = ['Delhi', 'Gurgaon', 'Noida', 'Karnal'];
const counts = { website: 0, brand: 0, homeWebsite: 0, faq: 0, service: 0 };
const faqSkipped = [];
for (const file of fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))) {
  const full = path.join(PAGES_DIR, file);
  const page = JSON.parse(fs.readFileSync(full, 'utf8'));
  const before = JSON.stringify(page);

  // 2. brand name in LocalBusiness
  page.jsonLd = page.jsonLd.map((b) => {
    const next = b.replace(
      /("@type":"LocalBusiness","@id":"[^"]+","name":)"9th-Corner"/,
      `$1"${BRAND}","alternateName":${JSON.stringify(ALT_NAMES)}`,
    );
    if (next !== b) counts.brand++;
    return next;
  });

  // 1. WebSite: update the homepage's inline block, add one everywhere else
  const inline = /"@type": "WebSite",\s*"name": "Ninth Corner",/;
  if (inline.test(page.html)) {
    page.html = page.html.replace(inline, `"@type": "WebSite",\n  "@id": "${SITE}#website",\n  "name": "${BRAND}",\n  "alternateName": "${ALT_NAMES[0]}",`);
    counts.homeWebsite++;
  } else if (!hasType(page, 'WebSite')) {
    page.jsonLd.push(WEBSITE);
    counts.website++;
  }

  // 3. FAQPage from the visible FAQ section
  if (!hasType(page, 'FAQPage')) {
    const qs = visibleFaq(page.html);
    if (qs.length) {
      page.jsonLd.push(JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs }));
      counts.faq++;
    } else if (/Frequently Asked Questions/i.test(page.html)) {
      faqSkipped.push(file);
    }
  }

  // 4. Service on service pages (no price/offer: the site lists none). Name = H1, area = the
  //    place after " in " in the H1; root service pages serve the whole region.
  if (/(^|__)services-/.test(file) && !hasType(page, 'Service')) {
    const h1 = decode((page.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || ['', ''])[1]);
    const place = (h1.match(/\s+in\s+(.+)$/i) || [])[1];
    page.jsonLd.push(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: h1,
        serviceType: h1.replace(/\s+in\s+.+$/i, ''),
        description: page.meta.description,
        url: page.meta.canonical || page.meta.og?.url,
        provider: { '@id': `${SITE}#organization` },
        areaServed: place ? { '@type': 'Place', name: place } : ROOT_AREAS.map((name) => ({ '@type': 'City', name })),
      }),
    );
    counts.service++;
  }

  if (JSON.stringify(page) !== before && !reportOnly) fs.writeFileSync(full, JSON.stringify(page));
}
console.log(
  `${reportOnly ? 'would add' : 'added'}: WebSite ${counts.website}, homepage WebSite updated ${counts.homeWebsite}, ` +
    `brand name fixed ${counts.brand}, FAQPage ${counts.faq}, Service ${counts.service}`,
);
if (faqSkipped.length) console.log('FAQ heading found but no Q/A pairs parsed:', faqSkipped.join(', '));
