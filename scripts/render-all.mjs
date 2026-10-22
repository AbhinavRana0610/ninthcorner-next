// Renders every page of the legacy PHP site into scripts/.rendered/<route>.html
// Usage: node scripts/render-all.mjs [legacyRoot] [phpBinary]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const LEGACY = process.argv[2] || 'C:/Xampp setup/htdocs/ninthcornernew';
const PHP = process.argv[3] || 'C:/Xampp setup/php/php.exe';
const OUT = path.resolve('scripts/.rendered');

export const CITIES = ['chhattarpur', 'delhi', 'gurgaon', 'hauzkhas', 'karnal', 'noida', 'pitampura', 'rajokri'];

// Includes, form handlers and legacy files that .htaccess always 301-redirects away.
const NOT_PAGES = new Set([
  'header.php', 'footer.php', 'send-enquiry.php', 'send_email.php', 'form-handler.php', '404.php',
  'interior-design-services.php', 'best-interior-designers.php', 'luxury-home-interior-designs.php',
  'top-interior-design-firm.php', 'modern-interior-design.php', 'interior-designer-for-office.php',
  'salon-interior-designer-blog.php', 'small-flat-services-blog.php', 'top-interior-design-firm-blog.php',
  'blo2.php',
]);

function pagesIn(dir) {
  return fs.readdirSync(path.join(LEGACY, dir)).filter((f) => f.endsWith('.php') && !NOT_PAGES.has(f));
}

const jobs = [];
for (const f of pagesIn('.')) jobs.push({ rel: f, uri: f === 'index.php' ? '/' : `/${f}` });
for (const c of CITIES) {
  for (const f of pagesIn(c)) jobs.push({ rel: `${c}/${f}`, uri: f === 'index.php' ? `/${c}/` : `/${c}/${f}` });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const job of jobs) {
  const html = execFileSync(PHP, [path.resolve('scripts/render.php'), LEGACY, job.rel, job.uri], {
    maxBuffer: 64 * 1024 * 1024,
  }).toString('utf8');
  const name = job.rel.replace(/\//g, '__') + '.html';
  fs.writeFileSync(path.join(OUT, name), html);
  manifest.push({ ...job, file: name });
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`rendered ${manifest.length} pages`);
