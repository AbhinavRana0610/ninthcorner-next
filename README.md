# 9th-Corner — Next.js

Next.js 16 port of the legacy PHP site (`../ninthcornernew`, www.ninthcorner.in).
The goal is an exact replica: same URLs (including `.php`), text, images, CSS cascade and GSAP animations.

## How it is built

| Part | Where |
|---|---|
| `<head>` assets (GA, GTM, Inter, Font Awesome, GSAP, `style.min.css`) | `components/SiteHead.tsx` |
| Header + fullscreen menu (root and city variants) | `components/Header.tsx` |
| Footer, floating WhatsApp/Call/scroll-top widget | `components/Footer.tsx` |
| Header/footer CSS, copied verbatim from header.php / footer.php | `components/chrome-assets.ts` |
| All 468 pages (root + 8 cities), statically generated | `app/[[...slug]]/page.tsx` + `content/` |
| Page metadata (title, description, canonical, OG, Twitter, JSON-LD) | `content/pages/*.json` → `lib/pages.ts` |
| Enquiry forms → email via Resend | `app/api/enquiry/route.ts` |
| `.htaccess` redirects, `/delhi` → `/delhi/`, old NBSP image paths | `proxy.ts` |
| 404 page (replica of 404.php) | `app/not-found.tsx` |
| Legacy JS/CSS and images, unchanged | `public/js`, `public/css`, `public/img` |

Each page body is the legacy PHP output between the shared header and footer, server-rendered as-is,
so its inline `<style>`/`<script>` blocks run during parsing exactly as before.

## Regenerating page content from the PHP site

Edit content in the PHP site, then (needs XAMPP's PHP):

```bash
npm run legacy:render    # renders every PHP page to scripts/.rendered (args: legacyRoot phpBinary)
npm run legacy:extract   # writes content/pages/*.json + content/routes.json
```

`scripts/extract.mjs` documents every deliberate change it makes (absolute URLs, NBSP folder names,
approved typo fixes, real form submission, `?success` messages).

To check the Next build against the PHP site page by page (text, image order, CSS blocks):

```bash
php -S 127.0.0.1:8090 -t ../ninthcornernew   # in one terminal
npm run build && npx next start -p 3100       # in another
node scripts/compare.mjs
```

## Environment

Copy `.env.example` to `.env.local` (and set the same variables in Vercel):

- `RESEND_API_KEY` — Resend API key
- `ENQUIRY_FROM` — sender on a domain verified in Resend, e.g. `Ninth Corner Website <enquiry@ninthcorner.in>`
- `ENQUIRY_TO`, `ENQUIRY_BCC` — optional; default to the legacy recipients

## Commands

```bash
npm run dev     # development
npm run build   # production build (468 static pages)
npm start       # serve the build
```
