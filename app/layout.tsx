import type { Metadata, Viewport } from 'next';

// Deliberately bare: each page brings the legacy <head> assets itself (components/SiteHead),
// so the standalone 404 page can keep its own look exactly like 404.php.
export const metadata: Metadata = {
  metadataBase: new URL('https://www.ninthcorner.in'),
  icons: {
    icon: [
      { url: '/img/favicon-9c.ico', sizes: 'any' },
      { url: '/img/favicon-9c.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/img/favicon-9c.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f141f',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
