// Extensionless URLs: drops ".php" from every internal URL in content/routes.json and
// content/pages/*.json (links, canonical, og/twitter URLs, JSON-LD). "/index.php" becomes
// "/" and "/<city>/index.php" becomes "/<city>/". proxy.ts 301-redirects the old .php URLs.
//
//   node scripts/remove-php-ext.mjs
//
// Idempotent; re-run it after `npm run legacy:extract`, as the very last step (the other
// apply-* scripts match pages by their .php routes).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const PAGES_DIR = path.join(CONTENT_DIR, 'pages');

// Absolute (production domain) or root-relative URL ending in ".php", not part of a longer
// word or another site's URL.
const URL_RE = /(?<![\w.:/])((?:https:\/\/www\.ninthcorner\.in)?\/(?:[\w-]+\/)*)([\w-]+)\.php(?!\w)/g;

const strip = (s) => s.replace(URL_RE, (_, dir, name) => (name === 'index' ? dir : dir + name));

// The homepage enquiry form's relative redirect_to.
const FIXES = [['value=\\"index.php?success=1#enquire-now\\"', 'value=\\"/?success=1#enquire-now\\"']];

const routesFile = path.join(CONTENT_DIR, 'routes.json');
const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
for (const r of routes) {
  r.route = strip(r.route);
  r.slug = r.slug.map((s) => s.replace(/\.php$/, ''));
}
fs.writeFileSync(routesFile, JSON.stringify(routes, null, 1) + '\n');

let changed = 0;
for (const file of fs.readdirSync(PAGES_DIR)) {
  const full = path.join(PAGES_DIR, file);
  const before = fs.readFileSync(full, 'utf8');
  let after = strip(before);
  for (const [from, to] of FIXES) after = after.split(from).join(to);
  if (after !== before) {
    fs.writeFileSync(full, after);
    changed++;
  }
}

const left = fs
  .readdirSync(PAGES_DIR)
  .flatMap((f) => fs.readFileSync(path.join(PAGES_DIR, f), 'utf8').match(/[^\s"'\\(<>=]*\.php(?!\w)/g) ?? []);
console.log(`routes: ${routes.length}, pages changed: ${changed}, ".php" left: ${left.length}`);
if (left.length) console.log([...new Set(left)].join('\n'));
