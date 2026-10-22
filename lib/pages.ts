import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

// Data files produced by scripts/extract.mjs from the rendered legacy PHP site.
const CONTENT_DIR = path.join(process.cwd(), 'content');

export type PageMeta = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  author?: string;
  publisher?: string;
  canonical?: string;
  'google-site-verification'?: string;
  og: Record<string, string | undefined>;
  twitter: Record<string, string | undefined>;
};

export type LegacyPage = {
  route: string;
  city: string | null;
  /** The page had its own <head> and included header.php inside <body>. */
  nested: boolean;
  meta: PageMeta;
  jsonLd: string[];
  preloads: { href: string; media: string | null }[];
  html: string;
};

type RouteEntry = { route: string; slug: string[]; key: string };

let routesCache: RouteEntry[] | null = null;

export function allRoutes(): RouteEntry[] {
  routesCache ??= JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'routes.json'), 'utf8')) as RouteEntry[];
  return routesCache;
}

export function routeFromSlug(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) return '/';
  // A bare city segment is that city's index page, served at "/<city>/".
  if (slug.length === 1 && !slug[0].includes('.')) return `/${slug[0]}/`;
  return '/' + slug.join('/');
}

export function getPage(slug: string[] | undefined): LegacyPage | null {
  const route = routeFromSlug(slug?.map((s) => decodeURIComponent(s)));
  const entry = allRoutes().find((r) => r.route === route);
  if (!entry) return null;
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'pages', entry.key + '.json'), 'utf8')) as LegacyPage;
}

export function toMetadata(m: PageMeta): Metadata {
  const og = m.og;
  const tw = m.twitter;
  return {
    title: m.title ? { absolute: m.title } : undefined,
    description: m.description,
    keywords: m.keywords,
    robots: m.robots,
    authors: m.author ? [{ name: m.author }] : undefined,
    publisher: m.publisher,
    alternates: m.canonical ? { canonical: m.canonical } : undefined,
    verification: m['google-site-verification'] ? { google: m['google-site-verification'] } : undefined,
    openGraph: og.title
      ? {
          type: 'website',
          siteName: og.site_name,
          title: og.title,
          description: og.description,
          url: og.url,
          images: og.image
            ? [
                {
                  url: og.image,
                  secureUrl: og['image:secure_url'],
                  type: og['image:type'],
                  width: og['image:width'] ? Number(og['image:width']) : undefined,
                  height: og['image:height'] ? Number(og['image:height']) : undefined,
                  alt: og['image:alt'],
                },
              ]
            : undefined,
        }
      : undefined,
    twitter: tw.card
      ? {
          card: 'summary_large_image',
          title: tw.title,
          description: tw.description,
          images: tw.image ? [tw.image] : undefined,
        }
      : undefined,
  };
}
