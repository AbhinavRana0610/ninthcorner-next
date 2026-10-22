import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // City index pages live at "/delhi/" (with slash) like the Apache site; proxy.ts
  // adds the slash to "/delhi" and every other URL keeps its exact form.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,

  // Same caching policy as the legacy .htaccess.
  async headers() {
    return [
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:dir(css|js)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
      {
        source: '/:path*',
        headers: [{ key: 'Strict-Transport-Security', value: 'max-age=300' }],
      },
    ];
  },
};

export default nextConfig;
