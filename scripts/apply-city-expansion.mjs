// Rebuilds the short service pages of Chhattarpur, Rajokri, Hauz Khas, Pitampura and Karnal
// in the Delhi service-page layout (content/city-expansion/service-page.css) and adds the
// extra local content from content/city-expansion/<city>.json, so they match the depth and
// look of the Delhi/Gurgaon/Noida pages:
//   hero > intro (h2 + page intro + extra paragraph) > philosophy box > 4 cards (2 + 2
//   full-width; the page's own three feature cards become bold-label lines in the
//   features card) > Why Choose Us (intro + reason cards) > project gallery > FAQ > closing
// The gallery shows five photos from the city's "_gallery" pool (nearby projects).
//
//   node scripts/apply-city-expansion.mjs hauzkhas            apply
//   node scripts/apply-city-expansion.mjs hauzkhas --check    report only
//
// The page's own pieces (hero, intro, philosophy, cards, reasons, CTA, FAQ) are read from the
// legacy markup and saved to content/city-expansion/base/<page key>.json; once a page is
// rebuilt, later runs read them from there, so the script is idempotent. Re-run it after
// `npm run legacy:extract`, after apply-faqs and before apply-schema.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'content/city-expansion');
const city = process.argv[2];
const checkOnly = process.argv.includes('--check');
if (!city) throw new Error('usage: node scripts/apply-city-expansion.mjs <city> [--check]');

const pages = JSON.parse(fs.readFileSync(path.join(DIR, `${city}.json`), 'utf8'));
const CSS = fs.readFileSync(path.join(DIR, 'service-page.css'), 'utf8');
const MARK = '<!-- CITY-EXPANSION -->';

function need(html, re, label) {
  const m = re.exec(html);
  if (!m) throw new Error(`not found in legacy markup: ${label}`);
  return m;
}

// The page's own content, from the legacy template.
function readBase(html) {
  const intro = need(html, /<div class="intro-text">([\s\S]*?)<\/div>/, 'intro')[1].trim();
  const phil = need(html, /<div class="philosophy-box">\s*<h2>([\s\S]*?)<\/h2>([\s\S]*?)<\/div>/, 'philosophy');
  const grid = need(html, /<div class="services-grid">([\s\S]*?)<\/div>\s*<section class="why-choose-us">/, 'services grid')[1];
  const cards = [...grid.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [m[1].trim(), m[2].trim()]);
  const why = need(html, /<section class="why-choose-us">([\s\S]*?)<\/section>/, 'why choose us')[1];
  return {
    h1: need(html, /<section class="hero-section">[\s\S]*?<h1>([\s\S]*?)<\/h1>/, 'h1')[1].trim(),
    heroImage: need(html, /\.hero-section\s*\{[^}]*?background-image:\s*url\(([^)]*)\)/, 'hero image')[1],
    intro,
    philosophyHeading: phil[1].trim(),
    philosophy: phil[2].trim(),
    cards,
    reasons: [...why.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim()),
    cta: need(why, /<p class="(?:final-)?cta(?:-message)?">([\s\S]*?)<\/p>/, 'cta')[1].trim(),
    faq: need(html, /(?:<!-- FAQS:auto -->\s*)?<section class="faq-section">[\s\S]*?<\/section>(?:\s*<!-- \/FAQS:auto -->)?/, 'faq')[0],
  };
}

// The city's project photos ("_gallery"), rotated so neighbouring pages start on different ones.
function gallery(x, index) {
  const g = pages._gallery;
  const images = g.images.map((_, i) => g.images[(i + index * 2) % g.images.length]).slice(0, 5);
  return { heading: g.heading, text: x.galleryText, images };
}

function build(b, x) {
  const card = (cls, h3, body) =>
    `            <div class="service-card${cls}">\n                <h3>${h3}</h3>\n                ${body}\n            </div>\n`;
  const features = x.features[1] + b.cards.map(([h3, p]) => `<p><b>${h3}:</b> ${p}</p>`).join('');
  const reasons = [...b.reasons.map((t, i) => [t, x.whyText[i]]), ...x.whyMore]
    .map(([t, d]) => `                <li>\n                    <strong>${t}</strong>\n                    ${d}\n                </li>\n`)
    .join('');
  const group = (hidden) =>
    `                    <div class="gallery-carousel-group"${hidden ? ' aria-hidden="true"' : ''}>\n` +
    x.gallery.images
      .map(
        ([src, alt, title]) =>
          `                        <div class="gallery-card">\n                            <div class="gallery-img-wrap">\n                                <img width="800" height="550" decoding="async" loading="lazy" src="${src}" alt="${alt}" title="${title}">\n                            </div>\n                        </div>\n`,
      )
      .join('') +
    `                    </div>\n`;
  return `${MARK}
    <style>
${CSS.replace(/(\.hero-section\s*\{[^}]*?background-image:\s*url\()[^)]*\)/, `$1${b.heroImage})`)}    </style>

    <!-- HERO SECTION -->
    <section class="hero-section">
        <div class="container">
            <h1>${b.h1}</h1>
        </div>
    </section>

    <!-- MAIN CONTENT WRAPPER -->
    <div class="container content-wrap">

        <!-- INTRO -->
        <div class="intro-text">
            <h2>${x.introHeading}</h2>
            ${b.intro}
            ${x.intro}
        </div>

        <!-- PHILOSOPHY / SERVICE OVERVIEW -->
        <div class="philosophy-box">
            <h2>${b.philosophyHeading}</h2>
            ${b.philosophy}
        </div>

        <!-- SERVICE CATEGORIES GRID (4 CARDS) -->
        <div class="services-grid">
${card('', ...x.cards[0])}${card('', ...x.cards[1])}${card(' full-width', x.features[0], features)}${card(' full-width', ...x.process)}        </div>

        <!-- WHY CHOOSE US -->
        <section class="why-choose-us">
            <h2>${x.whyHeading}</h2>
            <div class="why-choose-intro">
                ${x.whyIntro}
            </div>
            <ul class="reason-list">
${reasons}            </ul>
            <div class="final-cta-message">
                <p>${b.cta}</p>
            </div>
        </section>

        <!-- WORK DONE / PORTFOLIO SHOWCASE -->
        <section class="work-gallery-section">
            <div class="gallery-header">
                <h2>${x.gallery.heading}</h2>
                <p>${x.gallery.text}</p>
            </div>
            <div class="gallery-carousel-wrapper">
                <div class="gallery-carousel-track">
${group(false)}${group(true)}${group(true)}${group(true)}                </div>
            </div>
        </section>

        ${b.faq}

        <!-- CLOSING SECTION -->
        <div class="closing-section">
            <h2>${x.closingHeading}</h2>
            ${x.closing}
        </div>

    </div>
`;
}

let failed = 0;
for (const [index, [page, entry]] of Object.entries(pages).filter(([k]) => !k.startsWith('_')).entries()) {
  const x = { ...entry, gallery: gallery(entry, index) };
  const key = `${city}__${page}`;
  const file = path.join(ROOT, 'content/pages', `${key}.json`);
  const baseFile = path.join(DIR, 'base', `${key}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let html;
  try {
    const rebuilt = data.html.includes(MARK);
    const base = rebuilt ? JSON.parse(fs.readFileSync(baseFile, 'utf8')) : readBase(data.html);
    if (base.cards.length !== 3 || base.reasons.length !== x.whyText.length) {
      throw new Error(`expected 3 cards and ${x.whyText.length} reasons, found ${base.cards.length} and ${base.reasons.length}`);
    }
    if (!rebuilt && !checkOnly) {
      fs.mkdirSync(path.dirname(baseFile), { recursive: true });
      fs.writeFileSync(baseFile, JSON.stringify(base, null, 2) + '\n');
    }
    html = build(base, x);
  } catch (e) {
    console.error(`  ✗ ${page}: ${e.message}`);
    failed++;
    continue;
  }
  if (!checkOnly && html !== data.html) {
    data.html = html;
    fs.writeFileSync(file, JSON.stringify(data));
  }
  console.log(`${checkOnly ? 'checked' : 'applied'}  ${page}`);
}
if (failed) {
  console.error(`${failed} page(s) failed`);
  process.exit(1);
}
