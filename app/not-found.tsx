import type { Metadata } from 'next';

// Replica of the legacy 404.php (standalone page, no site header/footer).
export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | 9th-Corner' },
  robots: 'noindex, follow',
};

const CSS = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Georgia,'Times New Roman',serif;background:#0f141f;color:#e0e0e0;
         min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
    .wrap{max-width:640px}
    .code{font-size:clamp(72px,18vw,150px);font-weight:bold;color:#cdba96;line-height:1;letter-spacing:4px}
    h1{font-size:clamp(20px,4vw,30px);color:#cdba96;margin:18px 0 6px;font-weight:600}
    .divider{width:120px;height:1px;background:#cdba96;margin:22px auto;opacity:.7}
    p{font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#c7c7c7;margin-bottom:8px}
    .links{margin-top:30px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
    a.btn{font-family:Arial,Helvetica,sans-serif;text-decoration:none;font-size:14px;letter-spacing:1px;
          text-transform:uppercase;padding:13px 28px;border:1px solid #cdba96;color:#cdba96;
          border-radius:6px;transition:all .25s ease}
    a.btn:hover{background:#cdba96;color:#0f141f}
    a.btn.solid{background:#cdba96;color:#0f141f}
    a.btn.solid:hover{background:transparent;color:#cdba96}
`;

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="wrap">
        <div className="code">404</div>
        <h1>Page Not Found</h1>
        <div className="divider" />
        <p>The page you&apos;re looking for has moved or no longer exists.</p>
        <p>Let&apos;s get you back to designing beautiful spaces with 9th-Corner.</p>
        <div className="links">
          <a className="btn solid" href="/index.php">Back to Home</a>
          <a className="btn" href="/project.php">View Projects</a>
          <a className="btn" href="/contact.php">Contact Us</a>
        </div>
      </div>
    </>
  );
}
