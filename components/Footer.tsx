import { FOOTER_CSS, SCROLL_TOP_SCRIPT } from './chrome-assets';

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.4170563623336!2d77.14929711508392!3d28.691647382402873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0233746686df%3A0xea6034fbf6163900!2sNinth%20Corner%20Incorporation!5e0!3m2!1sen!2sin!4v1727684945678!5m2!1sen!2sin';

const SOCIAL = [
  { href: 'https://wa.me/919310582834', label: 'WhatsApp', title: 'Chat with us on WhatsApp', icon: 'fab fa-whatsapp', color: '#25d366' },
  {
    href: 'https://www.facebook.com/ninthcornerINC?rdid=qQBjZXSOHCqR9bdZ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17JRiw2G5t%2F#',
    label: 'Facebook',
    title: 'Facebook',
    icon: 'fab fa-facebook-f',
    color: '#1877f2',
  },
  { href: 'https://www.instagram.com/9thcorner.interiors/', label: 'Instagram', title: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
  { href: 'https://www.linkedin.com/company/9th-corner-int/', label: 'LinkedIn', title: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0a66c2' },
  { href: 'https://www.behance.net/rahulgupta16', label: 'Behance', title: 'Behance', icon: 'fa-brands fa-behance', color: '#1769ff' },
  { href: 'https://youtube.com/@9thcorner?si=Os9SAIk4Caspbfjh', label: 'Youtube', title: 'Youtube', icon: 'fa-brands fa-youtube', color: '#ff0000' },
];

const WHATSAPP_PATH =
  'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z';

const PHONE_PATH =
  'M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z';

export default function Footer({ city }: { city: string | null }) {
  const base = city ? `/${city}/` : '/';
  const goldIcon = { color: '#d4af37', marginRight: '6px' };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />

      <footer className="footer">
        <div className="max-w-7xl">
          <div className="footer-container">
            <div className="footer-column company-info">
              <h2>Ninth Corner Dream Designs Private Limited</h2>
              <p style={{ maxWidth: '250px' }}>Designing and building the future, one project at a time.</p>
            </div>

            <div className="footer-column">
              <h3>Services</h3>
              <ul>
                <li><a href="#" title="Interior Design">Interior Design</a></li>
                <li><a href="#" title="Architecture">Architecture</a></li>
                <li><a href="#" title="Construction">Construction</a></li>
                <li><a href="#" title="Vastu">Vastu</a></li>
                <li><a href={`${base}interior-design-service-areas.php`} title="Global">Global </a> </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Social Media</h3>
              <div className="social-icons">
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label} target="_blank" title={s.title}>
                    <i className={s.icon} style={{ color: s.color }} />
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-column">
              <h3>Contact</h3>
              <p style={{ marginBottom: '4px' }}>9310582834</p>
              <p style={{ marginBottom: '4px' }}>011 4264 4297</p>
              <p>9810582834</p>
            </div>
          </div>

          <div className="address-map-row">
            <div className="footer-address-col">
              <h3>Address</h3>
              <ul>
                <li>
                  <span className="label"><i className="fas fa-building" style={goldIcon} />Head Office:</span>
                  <p>Pearls Best Heights I, 808, 1, Lala Jagat Narayan Marg,<br /> Netaji Subhash Place, Pitampura, Delhi, 110034</p>
                </li>
                <li style={{ marginTop: '12px' }}>
                  <span className="label"><i className="fas fa-map-marker-alt" style={goldIcon} />Branch:</span>
                  <p>Sushant Lok, Phase-1, Sector-43, Gurgaon-122009</p>
                </li>
              </ul>
            </div>
            <div className="footer-map-col">
              <h3><i className="fas fa-location-arrow" style={goldIcon} />Find Us on Map</h3>
              <div className="footer-map-wrapper">
                <iframe
                  src={MAP_SRC}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ninth Corner Google Maps Location"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="copyright">
          <p>
            &copy; 2025 9th Corner - Designed By{' '}
            <a href="https://promopact.in/" style={{ fontWeight: 500, color: '#fff' }} target="_blank" title="Promopact Marketing Pvt. Ltd.">
              <b> Promopact Marketing Pvt. Ltd.</b>
            </a>{' '}
            All rights reserved.
          </p>
        </div>
      </footer>

      <script defer src="/js/9th.min.js?v=20260928" />

      <div className="ninth-floating-widget" id="ninthFloatingWidget" aria-label="Contact quick actions">
        <button type="button" className="ninth-float-item float-scroll-top" id="ninthScrollTop" title="Scroll to top" aria-label="Scroll to top">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <a href="tel:+919310582834" className="ninth-float-item float-call" title="Call Us: +91 9310582834" aria-label="Call +919310582834">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d={PHONE_PATH} />
          </svg>
          <span className="float-tooltip">Call Now</span>
        </a>

        <a
          href="https://wa.me/919310582834?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20interior%20design%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="ninth-float-item float-whatsapp"
          title="Chat on WhatsApp"
          aria-label="WhatsApp Chat"
        >
          <span className="whatsapp-pulse-ring" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d={WHATSAPP_PATH} />
          </svg>
          <span className="float-tooltip">Chat on WhatsApp</span>
        </a>
      </div>

      <script dangerouslySetInnerHTML={{ __html: SCROLL_TOP_SCRIPT }} />
    </>
  );
}
