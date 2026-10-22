import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SiteHead from '@/components/SiteHead';
import { allRoutes, getPage, toMetadata } from '@/lib/pages';

type Params = { slug?: string[] };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allRoutes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = getPage((await params).slug);
  return page ? toMetadata(page.meta) : {};
}

export default async function LegacyPage({ params }: { params: Promise<Params> }) {
  const page = getPage((await params).slug);
  if (!page) notFound();

  for (const p of page.preloads) {
    preload(p.href, { as: 'image', fetchPriority: 'high', media: p.media ?? undefined });
  }

  return (
    <>
      <SiteHead />
      {page.jsonLd.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <Header city={page.city} withStyle={!page.nested} />
      {/*
        Page body from the legacy site, server-rendered as-is so its inline <style>
        and <script> blocks run during parsing exactly as they did under PHP.
        display: contents keeps the wrapper out of layout.
      */}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: page.html }} suppressHydrationWarning />
      <Footer city={page.city} />
    </>
  );
}
