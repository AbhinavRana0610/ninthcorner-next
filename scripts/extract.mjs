// Turns the PHP-rendered pages (scripts/.rendered) into data files the Next.js
// app renders: content/pages/<key>.json + content/routes.json.
//
// The page body between the shared header and footer is kept byte-for-byte,
// apart from these deliberate, mechanical changes:
//   - relative URLs are made root-absolute (pages are no longer served from a
//     directory, so "img/x" or "../img/x" must become "/img/x")
//   - NBSP characters in image folder names become regular spaces (folders renamed)
//   - stray <html>/<head>/<body> tags left inside the body are dropped
//   - text typos the client approved fixing ("Electric" -> "Eclectic", "Artical" -> "Article")
//   - forms post to /api/enquiry, and the formerly fake forms really send
//   - the ?success messages that PHP printed are rendered hidden and revealed client-side
import fs from 'node:fs';
import path from 'node:path';
import { decodeHTML } from 'entities';

const SRC = path.resolve('scripts/.rendered');
const OUT = path.resolve('content/pages');
const CITIES = ['chhattarpur', 'delhi', 'gurgaon', 'hauzkhas', 'karnal', 'noida', 'pitampura', 'rajokri'];
const FOOTER_MARK = '<!-- Footer Section -->\n   <style>\n        /* Base Styles for the Footer */';
const GLOBAL_CSS = '/css/style.min.css?v=20261014-7';

const counters = {};
const count = (k, n = 1) => (counters[k] = (counters[k] || 0) + n);
const unknownMeta = new Set();

/* ------------------------------------------------------------------ helpers */

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[2] ?? m[3];
  return out;
}

function fixImgPath(p) {
  return p.includes('img/') ? p.replace(/%C2%A0/gi, ' ').replace(/ /g, ' ') : p;
}

// Resolve a URL from the legacy page against its directory (e.g. "/delhi/").
function resolve(rawValue, baseDir) {
  // Browsers strip leading/trailing whitespace from URL attributes; some legacy src values have it.
  const value = rawValue.trim();
  if (value === '' || value.includes('<?') || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(value)) return value;
  if (value.startsWith('/')) return fixImgPath(value);
  const cut = value.search(/[?#]/);
  const pathPart = cut === -1 ? value : value.slice(0, cut);
  const rest = cut === -1 ? '' : value.slice(cut);
  const segs = (baseDir + pathPart).split('/');
  const outSegs = [];
  for (const s of segs) {
    if (s === '' || s === '.') continue;
    if (s === '..') outSegs.pop();
    else outSegs.push(s);
  }
  let resolved = '/' + outSegs.join('/');
  if ((pathPart.endsWith('/') || pathPart === '.' || pathPart === '' || pathPart.endsWith('/.')) && !resolved.endsWith('/')) resolved += '/';
  return fixImgPath(resolved + rest);
}

function endOfElement(html, start, tagName) {
  const re = new RegExp(`<\\/?${tagName}\\b`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.indexOf('>', m.index) + 1;
  }
  throw new Error('unbalanced ' + tagName);
}

function parseHead(head) {
  const meta = { og: {}, twitter: {} };
  const t = head.match(/<title>([\s\S]*?)<\/title>/i);
  if (t) meta.title = decodeHTML(t[1].trim());
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(tag);
    const content = a.content !== undefined ? decodeHTML(a.content) : undefined;
    if (a.charset || a.name === 'viewport') continue;
    if (a.property?.startsWith('og:')) meta.og[a.property.slice(3)] = content;
    else if (a.name?.startsWith('twitter:')) meta.twitter[a.name.slice(8)] = content;
    else if (['description', 'keywords', 'robots', 'author', 'publisher', 'google-site-verification', 'theme-color'].includes(a.name)) meta[a.name] = content;
    else unknownMeta.add(tag);
  }
  for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
    const a = attrs(tag);
    if (a.rel === 'canonical') meta.canonical = a.href;
  }
  return meta;
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1].trim());
}

// Apply fn to the parts of html that are outside <script> elements.
function outsideScripts(html, fn) {
  const parts = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi);
  return parts.map((p, i) => (i % 2 ? p : fn(p))).join('');
}

function rewriteUrls(html, baseDir) {
  return outsideScripts(html, (part) =>
    part
      .replace(/(\s(?:href|src|action|data-bg|data-src|data-full-src|poster)\s*=\s*)(["'])([\s\S]*?)\2/gi,
        (_, pre, q, v) => pre + q + resolve(v, baseDir) + q)
      .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (_, q, v) => `url(${q}${resolve(v.trim(), baseDir)}${q})`),
  );
}

function replaceCounted(str, search, replacement, key) {
  const parts = str.split(search);
  if (parts.length > 1) count(key, parts.length - 1);
  return parts.join(replacement);
}

/* ---------------------------------------------------------- page patches */

const POPUP_ALERT = "alert('Thank you for your inquiry! We\\'ll be in touch. 😊');";
const POPUP_REAL = `fetch('/api/enquiry', { method: 'POST', body: new FormData(contactForm), headers: { 'Accept': 'application/json' } })
                        .then(function (res) { if (!res.ok) throw new Error('send failed'); alert('Thank you for your inquiry! We\\'ll be in touch. 😊'); })
                        .catch(function () { alert('❌ Error sending message'); });`;

const CITY_CONTACT_FAKE = /\/\/ Simulate successful asynchronous submission[\s\S]*?\}, 1500\); \/\/ Wait 1\.5 seconds to simulate network latency/;
const CITY_CONTACT_REAL = `// Send the enquiry
            displayMessage('Sending message...', 'success');

            fetch('/api/enquiry', { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
                .then(function (res) {
                    if (!res.ok) throw new Error('send failed');
                    displayMessage('Your message has been sent successfully! We will be in touch soon.', 'success');
                    document.getElementById('contactPageForm').reset(); // Clear form
                })
                .catch(function () {
                    displayMessage('There was an error sending your message. Please try again later.', 'error');
                });`;

// contact.php printed this banner when ?success was present.
const CONTACT_SUCCESS = `<div id="nc-contact-success" style="display: none;
    background: #e7f3ed;
    color: #2d5a43;
    padding: 15px;
    margin: 20px auto;
    max-width: 1100px;
    border-radius: 8px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    border: 1px solid #d0e6dc;
  ">
    <i class="fas fa-check-circle"></i> Thank You! Your enquiry has been successfully submitted.
  </div>
<script>if (new URLSearchParams(location.search).has('success')) document.getElementById('nc-contact-success').style.display = 'block';</script>
`;

// index.php printed this inside the consultation card when ?success=1.
const HOME_SUCCESS = `<div class="consult-success-msg" id="nc-home-success" style="display: none;">
                <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
                <span>Thank you! Your enquiry has been sent. Our team will get back to you shortly.</span>
            </div>
            <script>if (new URLSearchParams(location.search).get('success') === '1') document.getElementById('nc-home-success').style.display = '';</script>

            `;

function patchContent(html, route) {
  html = outsideScripts(html, (p) =>
    p
      .replace(/<!DOCTYPE[^>]*>|<\/?(?:html|head|body)\b[^>]*>/gi, () => (count('stray tags'), ''))
      .replace(/<span>Electric<\/span>/g, () => (count('typo Electric'), '<span>Eclectic</span>'))
      .replace(/Artical/g, () => (count('typo Artical'), 'Article'))
      .replace(/action="\/send-enquiry\.php"/g, () => (count('form action send-enquiry'), 'action="/api/enquiry"'))
      .replace(/action="(?:\/[a-z]+)?\/send_email\.php"/g, () => (count('form action send_email'), 'action="/api/enquiry"')),
  );
  html = replaceCounted(html, POPUP_ALERT, POPUP_REAL, 'popup form made real');
  if (CITY_CONTACT_FAKE.test(html)) {
    html = html.replace(CITY_CONTACT_FAKE, CITY_CONTACT_REAL);
    count('city contact form made real');
  }
  if (route === '/contact.php') {
    html = CONTACT_SUCCESS + html;
    count('contact success banner');
  }
  if (route === '/') {
    const formTag = '<form action="/api/enquiry" method="POST" class="consult-form">';
    if (!html.includes(formTag)) throw new Error('home consult form not found');
    html = html.replace(formTag, HOME_SUCCESS + formTag);
    count('home success message');
  }
  return html;
}

/* -------------------------------------------------------------- main loop */

const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const routes = [];

for (const page of manifest) {
  const h = fs.readFileSync(path.join(SRC, page.file), 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const route = page.uri;
  const baseDir = route.endsWith('/') ? route : route.slice(0, route.lastIndexOf('/') + 1);
  const city = CITIES.includes(route.split('/')[1]) ? route.split('/')[1] : null;

  const doctypes = [...h.matchAll(/<!DOCTYPE html>/gi)].map((m) => m.index);
  const nested = doctypes.length > 1; // page has its own <head>, header.php is included inside <body>
  const hdrStart = nested ? doctypes[1] : 0;
  const headerHead = h.slice(hdrStart, h.indexOf('</head>', hdrStart));

  const menuStart = h.indexOf('<div class="fullscreen-menu" id="menu">', hdrStart);
  const menuEnd = endOfElement(h, menuStart, 'div');
  const footIdx = h.lastIndexOf(FOOTER_MARK);
  if (menuStart < 0 || footIdx < menuEnd) throw new Error('layout markers missing in ' + page.file);

  let meta, prefix = '';
  if (nested) {
    const ownHead = h.slice(h.indexOf('<head>') + 6, h.indexOf('</head>'));
    const own = parseHead(ownHead);
    meta = { ...parseHead(headerHead), title: own.title, description: own.description, canonical: own.canonical };
    // Keep everything from the page's own <head> except what the metadata API now emits.
    const extras = ownHead
      .replace(/<meta\b[^>]*>|<title>[\s\S]*?<\/title>|<link\b[^>]*>|<!--[\s\S]*?-->/gi, '')
      .trim();
    // Cascade order of the original: page styles, then the global sheet again, then header styles.
    const headerStyle = headerHead.match(/<style>[\s\S]*<\/style>/)[0];
    prefix = extras + `\n<link rel="stylesheet" href="${GLOBAL_CSS}">\n` + headerStyle + '\n';
    count('nested-head pages');
  } else {
    meta = parseHead(headerHead);
  }

  const preloads = [...headerHead.matchAll(/<link rel="preload" as="image"[^>]*>/g)].map(([tag]) => {
    const a = attrs(tag);
    // City pages preloaded "img/..." relative to their folder, which never existed: point at /img/.
    const href = resolve(a.href, '/');
    return { href, media: a.media || null };
  });

  let html = prefix + h.slice(menuEnd, footIdx);
  html = rewriteUrls(html, baseDir);
  html = patchContent(html, route);

  const key = page.rel.replace(/\//g, '__').replace(/\.php$/, '');
  const slug = route.split('/').filter(Boolean);
  fs.writeFileSync(
    path.join(OUT, key + '.json'),
    JSON.stringify({ route, city, nested, meta, jsonLd: jsonLdBlocks(headerHead), preloads, html }),
  );
  routes.push({ route, slug, key });
}

fs.writeFileSync(path.resolve('content/routes.json'), JSON.stringify(routes, null, 1));
console.log(`extracted ${routes.length} pages`);
console.table(counters);
if (unknownMeta.size) console.log('unmapped meta tags:', [...unknownMeta]);
