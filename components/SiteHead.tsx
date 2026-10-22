import { preconnect } from 'react-dom';

const GA_ID = 'G-2RYVCCNKVF';
const GTM_ID = 'GTM-PRHM6LDD';

const GA_SCRIPT = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
`;

const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const INTER_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap';
const FONT_AWESOME_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
export const GLOBAL_CSS = '/css/style.min.css?v=20261014-7';

/**
 * Everything header.php put in <head>, in the same order. Stylesheets carry a
 * `precedence` so React hoists them into <head> ahead of the inline page styles,
 * which keeps the legacy cascade (global sheet first, page styles after).
 * GSAP stays as classic `defer` scripts so it still runs before js/9th.min.js.
 */
export default function SiteHead() {
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' });
  preconnect('https://cdnjs.cloudflare.com', { crossOrigin: 'anonymous' });

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script dangerouslySetInnerHTML={{ __html: GA_SCRIPT }} />
      <script dangerouslySetInnerHTML={{ __html: GTM_SCRIPT }} />
      <link rel="stylesheet" href={INTER_CSS} precedence="default" />
      <link rel="stylesheet" href={FONT_AWESOME_CSS} precedence="default" />
      <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" />
      <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" />
      <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js" />
      <link rel="stylesheet" href={GLOBAL_CSS} precedence="default" />
    </>
  );
}
