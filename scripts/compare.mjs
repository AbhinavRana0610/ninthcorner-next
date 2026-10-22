// Compares every page of the legacy PHP site with the Next.js build.
// Usage: node scripts/compare.mjs [phpOrigin] [nextOrigin]
//   e.g. php -S 127.0.0.1:8090 -t ../ninthcornernew   and   next start -p 3100
import fs from 'node:fs';
import { decodeHTML } from 'entities';

const PHP = process.argv[2] || 'http://127.0.0.1:8090';
const NEXT = process.argv[3] || 'http://localhost:3100';
const routes = JSON.parse(fs.readFileSync('content/routes.json', 'utf8'));

// Differences the client approved; applied to the PHP side before comparing.
const APPROVED = [
  [/\bElectric\b/g, 'Eclectic'],
  [/Artical/g, 'Article'],
];
// Hidden-until-?success messages that PHP omitted without the query string.
const HIDDEN_SUCCESS = [
  'Thank You! Your enquiry has been successfully submitted.',
  'Thank you! Your enquiry has been sent. Our team will get back to you shortly.',
];

function bodyOf(html) {
  // Legacy pages with their own <head> include header.php inside <body>; take from the site header on.
  const start = html.indexOf('<header>');
  return html.slice(start);
}

function visibleText(html) {
  let t = bodyOf(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  t = decodeHTML(t).replace(/\s+/g, ' ').trim();
  return t;
}

function normUrl(u) {
  return decodeURIComponent(u.trim()).replace(/ /g, ' ').replace(/^(\.\.\/)+|^\//, '').replace(/^(chhattarpur|delhi|gurgaon|hauzkhas|karnal|noida|pitampura|rajokri)\/(?=img\/)/, '');
}

function images(html) {
  return [...bodyOf(html).matchAll(/<img\b[^>]*\ssrc=["']([^"']*)["']/gi)].map((m) => normUrl(m[1]));
}

function styles(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1].replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (_, q, v) => `url(${normUrl(v)})`).replace(/\s+/g, ' ').trim())
    .filter((s) => s && !s.startsWith('/* Base Styles for the Footer */') && !s.includes('/* --- Header Styles --- */'));
}

function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `@${i}: PHP «${a.slice(Math.max(0, i - 60), i + 80)}»\n        NEXT «${b.slice(Math.max(0, i - 60), i + 80)}»`;
}

let ok = 0;
const problems = [];
for (const r of routes) {
  const [php, next] = await Promise.all(
    [PHP + encodeURI(r.route), NEXT + encodeURI(r.route)].map((u) => fetch(u).then((res) => res.text())),
  );
  let pText = visibleText(php);
  for (const [re, rep] of APPROVED) pText = pText.replace(re, rep);
  let nText = visibleText(next);
  for (const s of HIDDEN_SUCCESS) nText = nText.replace(s, '').replace(/\s+/g, ' ').trim();

  const issues = [];
  if (pText !== nText) issues.push('TEXT ' + firstDiff(pText, nText));
  const pi = images(php), ni = images(next);
  if (pi.join('|') !== ni.join('|')) issues.push(`IMAGES php=${pi.length} next=${ni.length} first diff: ${pi.find((x, i) => x !== ni[i])} vs ${ni.find((x, i) => x !== pi[i])}`);
  const ps = styles(php), ns = styles(next);
  if (ps.join('\n') !== ns.join('\n')) issues.push(`STYLES php=${ps.length} next=${ns.length} ` + firstDiff(ps.join('\n'), ns.join('\n')));

  if (issues.length) problems.push({ route: r.route, issues });
  else ok++;
}

console.log(`identical: ${ok}/${routes.length}`);
for (const p of problems.slice(0, 40)) console.log('\n' + p.route + '\n  ' + p.issues.join('\n  '));
if (problems.length > 40) console.log(`... and ${problems.length - 40} more`);
