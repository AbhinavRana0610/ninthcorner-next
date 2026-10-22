import type { MetadataRoute } from 'next';
import { allRoutes, getPage } from '@/lib/pages';

export default function sitemap(): MetadataRoute.Sitemap {
  // Every page's canonical URL (always its own route on the production domain).
  return allRoutes().flatMap((r) => {
    const canonical = getPage(r.slug)?.meta.canonical;
    return canonical ? [{ url: canonical }] : [];
  });
}
