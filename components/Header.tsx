/* eslint-disable @next/next/no-img-element -- plain <img> keeps the legacy markup and sizing identical */
import MenuButton from './MenuButton';
import { HEADER_CSS } from './chrome-assets';

type Props = {
  /** City folder slug (e.g. "delhi") or null for the root site. */
  city: string | null;
  /** False when the page re-emits the header styles itself to keep the legacy cascade. */
  withStyle?: boolean;
};

// Root and city header.php differ only in the menu (cities have "Services") and link titles.
export default function Header({ city, withStyle = true }: Props) {
  const base = city ? `/${city}/` : '/';
  const links = city
    ? [
        { href: base, title: 'Home', label: 'Home' },
        { href: `${base}services`, title: 'Services', label: 'Services' },
        { href: `${base}about-us`, title: 'About-Us', label: 'About-Us' },
        { href: `${base}project`, title: 'Projects', label: ' Projects ' },
        { href: `${base}gallery`, title: 'Gallery', label: 'Gallery' },
        { href: `${base}blog`, title: 'Blogs', label: 'Blogs' },
        { href: `${base}contact`, title: 'Contact-Us', label: 'Contact-Us' },
      ]
    : [
        { href: base, title: 'Home', label: 'Home' },
        { href: '/about-us', title: 'About Us', label: 'About-Us' },
        { href: '/project', title: 'Projects', label: ' Projects ' },
        { href: '/gallery', title: 'Gallery', label: 'Gallery' },
        { href: '/blog', title: 'Blogs', label: 'Blogs' },
        { href: '/contact', title: 'Contact Us', label: 'Contact-Us' },
      ];

  return (
    <>
      {withStyle && <style dangerouslySetInnerHTML={{ __html: HEADER_CSS }} />}

      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-PRHM6LDD"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      <header>
        <div className="logo">
          <a href={base} title={city ? '9th Corner interior design firm' : '9th Corner - Home'}>
            {' '}
            <img
              width={561}
              height={160}
              decoding="async"
              src="/img/logo-sm.avif"
              alt="9th Corner interior design firm"
              title="9th Corner interior design firm"
              style={{ maxHeight: '55px' }}
            />
          </a>
        </div>
        <MenuButton className="menu-toggle">Menu</MenuButton>
      </header>

      <div className="fullscreen-menu" id="menu">
        <MenuButton className="menu-close">✕</MenuButton>
        <div className="menu-left">
          <img
            width={614}
            height={808}
            decoding="async"
            src="/img/statue.avif"
            alt="Classical statue decor accent"
            title="Classical statue decor accent"
            className="statue-float"
          />
        </div>
        <div className="menu-right">
          {links.map((l) => (
            <a key={l.href} href={l.href} title={l.title}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
