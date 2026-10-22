// SEO slug cleanup: legacy page names with capitals or meaningless short forms,
// mapped to their new names (without ".php"). The same rename applies under every
// city prefix. proxy.ts 301-redirects the old URLs; content/ already uses the new ones.
export const PAGE_RENAMES: Record<string, string> = {
  // Capital letters
  'blog-best-affordable-interior-design-firm-for-2BHK': 'blog-best-affordable-interior-design-firm-for-2bhk',
  'blog-Best-interior-designers': 'blog-best-interior-designers',
  'blog-Exclusively-for-Premium-Homes-Theatre-Design-Services': 'blog-exclusively-for-premium-homes-theatre-design-services',
  'blog-Our-Process-of-Designing-Luxury-Office-Salons-and-Hotels-From-Vision-to-Reality':
    'blog-our-process-of-designing-luxury-office-salons-and-hotels-from-vision-to-reality',
  'services-Salon-interior-designer': 'services-salon-interior-designer',
  Luxuria: 'luxuria-interior-design',
  // Numbered short forms
  'ak-jain1': 'ak-jain-residence-interior-design',
  'dr-jain2': 'dr-jain-residence-interior-design',
  'alok-verma3': 'alok-verma-residence-interior-design',
  arun4: 'arun-residence-interior-design',
  'raj-gupta5': 'raj-gupta-residence-interior-design',
  rana6: 'rana-residence-interior-design',
  rao7: 'rao-residence-interior-design',
  sachin8: 'sachin-residence-interior-design',
  umesh9: 'umesh-residence-interior-design',
  virend10: 'virendra-residence-interior-design',
  anand11: 'anand-residence-interior-design',
  vijay12: 'vijay-residence-interior-design',
  blog1: 'blog-best-interior-designers-in-india',
  blog2: 'blog-hire-professional-interior-designers',
  blog3: 'blog-interior-design-for-homes',
  blog4: 'blog-architecture-services-in-india',
  blog5: 'blog-why-india-is-a-center-for-interior-design',
  global: 'interior-design-service-areas',
};

/** Page name after the rename (unchanged if it was never renamed). */
export function renamedPage(name: string): string {
  return PAGE_RENAMES[name] ?? name;
}

/**
 * Image path (decoded, relative or absolute) with every segment that has capitals or
 * whitespace (incl. non-breaking spaces) rewritten as lowercase-hyphen. Clean segments
 * are left alone, so this is the identity for paths that were never renamed.
 */
export function cleanImagePath(p: string): string {
  return p
    .split('/')
    .map((seg) => {
      if (!/[A-Z\s]/.test(seg)) return seg;
      const dot = /\.[A-Za-z0-9]+$/.exec(seg);
      const ext = dot ? dot[0].toLowerCase() : '';
      const stem = dot ? seg.slice(0, dot.index) : seg;
      const clean = stem
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return clean + ext;
    })
    .join('/');
}
