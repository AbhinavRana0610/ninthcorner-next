// Replaces generic or wrong image alt texts in content/pages/*.json with descriptive ones,
// and makes the project-page lightbox carry the alt of the photo it shows.
//
//   node scripts/apply-alt-text.mjs            apply + report
//   node scripts/apply-alt-text.mjs --report   report only
//
// Idempotent: a rule only fires while the old alt is still there, so re-run it after
// `npm run legacy:extract`. Each <img>'s title attribute is kept equal to its alt.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content/pages');
const reportOnly = process.argv.includes('--report');

const BRAND_OLD = 'Brand partnered with 9th-Corner interior design firm';
const BLOG_OLD_1 = 'Detail of a modern chair and lamp';
const BLOG_OLD_2 = 'Wide view of a luxurious and modern living room';

// [src, old alt, new alt]
const RULES = [
  // Homepage logo strip: these are design publications, not brands.
  ['/img/b1.avif', BRAND_OLD, 'The Telegraph logo'],
  ['/img/b2.avif', BRAND_OLD, 'Ideal Home magazine logo'],
  ['/img/b3.avif', BRAND_OLD, 'AnOther magazine logo'],
  ['/img/b4.avif', BRAND_OLD, 'I and D interiors and decor magazine logo'],
  ['/img/b5.avif', BRAND_OLD, 'Interior design magazine logo'],
  ['/img/b6.avif', BRAND_OLD, 'ELLE Decor magazine logo'],
  ['/img/b7.avif', BRAND_OLD, 'Dezeen design magazine logo'],
  ['/img/b8.avif', BRAND_OLD, 'Architectural Digest (AD) magazine logo'],
  ['/img/mag3.avif', 'Azure Magazine', 'Azure Magazine cover, Building Community issue'],

  // Project-page background (same photo on every project page).
  ['/img/911.avif', 'Decorative interior design section background by Ninth Corner',
    'Luxury living room with crystal chandelier and beige sofas designed by Ninth Corner'],

  // Gallery
  ['/img/project/mr-umesh-jain-bhivani/mr-umesh-jain-bhivani/2.avif', 'Office Project',
    'Contemporary facade with curved balconies at Mr Umesh Jain residence in Bhiwani by Ninth Corner'],
  ['/img/project/mr-rao-green-park/mr-rao-green-park/2.avif', 'Office Project',
    'Modern facade with landscaped terraces at Mr Rao residence in Green Park by Ninth Corner'],
  ['/img/ch12.avif', 'Luxury Lounge',
    'Double-height foyer with floating marble staircase and sculpture by Ninth Corner'],
  ['/img/project/mr-rana-noida/mr-rana-noida/8.avif', 'Luxury Lounge',
    'Dining room with twelve-seater table and ring chandelier at Mr Rana residence in Noida by Ninth Corner'],

  // Blog pages (blog1-5): the old alts did not match the photos.
  ['/img/owner1.avif', BLOG_OLD_1, 'Rahuul Guptaa, director of Ninth Corner interior design firm'],
  ['/img/ch12.avif', BLOG_OLD_2, 'Double-height foyer with floating marble staircase and sculpture by Ninth Corner'],
  ['/img/ch10.avif', BLOG_OLD_1, 'Modern multi-storey residence facade with evening lighting designed by Ninth Corner'],
  ['/img/ch19.avif', BLOG_OLD_2, 'Luxury living room with crystal chandelier, grey sofas and maroon armchairs by Ninth Corner'],
  ['/img/art6.avif', BLOG_OLD_1, 'Bright entryway with wooden bench and framed wall art'],
  ['/img/ind4.avif', BLOG_OLD_2, 'Industrial-style living room with exposed brick wall and pendant lights'],
  ['/img/about.avif', BLOG_OLD_1, 'Open-plan white living room and modular kitchen with sculptural ceiling light'],
  ['/img/sc4.avif', BLOG_OLD_2, 'Open kitchen with wooden island and grey cabinets in a double-height home'],
  ['/img/sc2.avif', BLOG_OLD_1, 'Galley kitchen with breakfast counter and black chandelier'],
  ['/img/min3.avif', BLOG_OLD_2, 'Minimalist interior with organic curved wall, round mirror and wooden console'],
];

// Lightbox placeholders: the real photo's alt is copied in by script when it opens.
const LIGHTBOX_OLD = 'Full size project image';
const GALLERY_LIGHTBOX_OLD = 'Gallery Image';
const LIGHTBOX_JS_OLD = 'lightboxImage.src = fullSrc;';
const LIGHTBOX_JS_NEW = "lightboxImage.src = fullSrc;\n            lightboxImage.alt = slide.querySelector('img')?.alt || lightboxImage.alt;";

const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function setAlt(tag, alt) {
  const v = escAttr(alt);
  return tag.replace(/\balt="[^"]*"/, `alt="${v}"`).replace(/\btitle="[^"]*"/, `title="${v}"`);
}

const counts = {};
const bump = (k) => (counts[k] = (counts[k] ?? 0) + 1);
let changedFiles = 0;

for (const file of fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))) {
  const full = path.join(PAGES_DIR, file);
  const page = JSON.parse(fs.readFileSync(full, 'utf8'));
  const project = page.meta?.title?.split(' | ')[0]?.trim();
  const before = page.html;

  let html = before.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\bsrc="([^"]*)"/)?.[1];
    const alt = tag.match(/\balt="([^"]*)"/)?.[1];
    if (alt === LIGHTBOX_OLD && project) {
      bump('lightbox placeholder (project)');
      return setAlt(tag, `${project} interior design photo, enlarged view`);
    }
    if (alt === GALLERY_LIGHTBOX_OLD) {
      bump('lightbox placeholder (gallery)');
      return setAlt(tag, 'Ninth Corner interior design portfolio photo, enlarged view');
    }
    const rule = RULES.find(([s, old]) => s === src && old === alt);
    if (!rule) return tag;
    bump(`${src} :: ${alt}`);
    return setAlt(tag, rule[2]);
  });

  if (html.includes(LIGHTBOX_JS_OLD) && !html.includes('lightboxImage.alt =')) {
    html = html.replace(LIGHTBOX_JS_OLD, LIGHTBOX_JS_NEW);
    bump('lightbox JS copies alt');
  }

  if (html !== before) {
    changedFiles++;
    if (!reportOnly) {
      page.html = html;
      fs.writeFileSync(full, JSON.stringify(page));
    }
  }
}

console.log(`${reportOnly ? 'Would change' : 'Changed'} ${changedFiles} page files`);
for (const [k, n] of Object.entries(counts).sort()) console.log(String(n).padStart(4), k);
