import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cleanImagePath, renamedPage } from '@/lib/slug-renames';

// Port of the legacy .htaccess redirect rules (all 301, same targets).
const CITY = '(?:chhattarpur|delhi|gurgaon|hauzkhas|karnal|noida|pitampura|rajokri)';
const LEGACY_SERVICES =
  '(interior-design-services|best-interior-designers|luxury-home-interior-designs|top-interior-design-firm|modern-interior-design|interior-designer-for-office|Salon-interior-designer|architecture-services|best-salon-interior-designer|farmhouse-interior-designer|interior-architect-for-showroom-design|residential-interior-design)';

const RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  // 0a/0b: misspelt city slugs
  [new RegExp(`^/guragaon/${LEGACY_SERVICES}\\.php$`), (m) => `/gurgaon/services-${m[1]}.php`],
  [/^\/guragaon(\/.*)?$/, (m) => `/gurgaon${m[1] ?? ''}`],
  [/^\/rajokari(\/.*)?$/, (m) => `/rajokri${m[1] ?? ''}`],
  // 0c: legacy service and blog URLs
  [new RegExp(`^/(${CITY}/)?${LEGACY_SERVICES}\\.php$`), (m) => `/${m[1] ?? ''}services-${m[2]}.php`],
  [new RegExp(`^/(${CITY}/)?blo2\\.php$`), (m) => `/${m[1] ?? ''}blog2.php`],
  [new RegExp(`^/(${CITY}/)?top-interior-design-firm-blog\\.php$`), (m) => `/${m[1] ?? ''}blog-the-top-interior-design-firm.php`],
  [new RegExp(`^/(${CITY}/)?salon-interior-designer-blog\\.php$`), (m) => `/${m[1] ?? ''}blog-best-salon-interior-designer.php`],
  [new RegExp(`^/(${CITY}/)?small-flat-services-blog\\.php$`), (m) => `/${m[1] ?? ''}blog-interior-design-services-offered-for-small-flats.php`],
  // 3/3b: /index.php -> /, /<city>/index.php -> /<city>/
  [/^\/index\.php$/, () => '/'],
  [new RegExp(`^/(${CITY})/index\\.php$`), (m) => `/${m[1]}/`],
  // Apache DirectorySlash: /<city> -> /<city>/
  [new RegExp(`^/(${CITY})$`), (m) => `/${m[1]}/`],
  // Extensionless URLs: every other "/<page>.php" (finalTarget drops the ".php" and applies
  // the SEO slug cleanup of lib/slug-renames.ts).
  [/^\/(.+)\.php$/, (m) => `/${m[1]}.php`],
  // Pages have no trailing slash; only "/" and the city index pages "/<city>/" do.
  [new RegExp(`^(?!/${CITY}/$)/(.+)/$`), (m) => `/${m[1]}`],
];

// Rules above target legacy ".php" names; point them at the final extensionless URL (with
// any later rename) so every legacy URL is a single 301.
function finalTarget(target: string): string {
  return target.replace(/([^/]+)\.php$/, (_, name: string) => (name === 'index' ? '' : renamedPage(name)));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Image paths with capitals or (non-breaking) spaces were renamed to lowercase-hyphen.
  if (pathname.startsWith('/img/')) {
    const decoded = decodeURIComponent(pathname);
    const clean = cleanImagePath(decoded);
    if (clean !== decoded) {
      return NextResponse.redirect(new URL(clean + request.nextUrl.search, request.url), 301);
    }
    return NextResponse.next();
  }

  for (const [re, target] of RULES) {
    const m = pathname.match(re);
    if (m) {
      // A plain URL, not nextUrl.clone(): NextURL would strip the trailing slash of "/delhi/".
      const url = new URL(finalTarget(target(m)) + request.nextUrl.search, request.url);
      return NextResponse.redirect(url, 301);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|api/|css/|js/|img/).*)', '/img/project/:path*', '/img/PROJECTS.avif'],
};
