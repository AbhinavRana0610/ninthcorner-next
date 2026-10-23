// Replaces send-enquiry.php (and the formerly fake popup / city contact forms).
// Classic form posts get a 303 redirect like the PHP version; fetch() callers
// that send "Accept: application/json" get a JSON result instead.

// Overridable only so the flow can be tested against a local stub.
const RESEND_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';

function field(form: FormData, ...names: string[]): string {
  for (const n of names) {
    const v = form.get(n);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

// Resolve redirect_to like a relative Location header from the submitting page,
// and only ever redirect within this site.
function redirectTarget(request: Request, form: FormData): URL {
  const site = new URL(request.url);
  const referer = request.headers.get('referer');
  const base = referer && new URL(referer).origin === site.origin ? new URL(referer) : new URL('/contact', site);
  const target = new URL(field(form, 'redirect_to') || 'contact?success=1', base);
  if (target.origin !== site.origin) return new URL('/contact?success=1', site);
  // Old .php redirect_to values: "index.php" -> "/", "<page>.php" -> "<page>" (as proxy.ts 301s them).
  target.pathname = target.pathname.replace(/(^|\/)index\.php$/, '$1').replace(/\.php$/, '');
  return target;
}

async function sendEmail(fields: { name: string; email: string; mobile: string; message: string; page: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM;
  if (!apiKey || !from) throw new Error('RESEND_API_KEY / ENQUIRY_FROM not configured');

  const to = (process.env.ENQUIRY_TO || 'ninthcorner83@gmail.com').split(',').map((s) => s.trim());
  const bcc = (process.env.ENQUIRY_BCC ?? 'poojarw09@gmail.com').split(',').map((s) => s.trim()).filter(Boolean);

  const text =
    'New enquiry details:\n\n' +
    `Name: ${fields.name}\n` +
    `Email: ${fields.email}\n` +
    `Mobile: ${fields.mobile}\n` +
    `Message: ${fields.message}\n` +
    (fields.page ? `\nSubmitted from: ${fields.page}\n` : '');

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      bcc: bcc.length ? bcc : undefined,
      reply_to: fields.email,
      subject: 'New Website Enquiry - Ninth Corner',
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

export async function POST(request: Request) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
  }

  const fields = {
    name: field(form, 'name'),
    email: field(form, 'email'),
    mobile: field(form, 'mobile', 'phone'),
    message: field(form, 'message'),
    page: request.headers.get('referer') || '',
  };

  if (!fields.name || !fields.email || !fields.message) {
    return wantsJson
      ? Response.json({ ok: false, error: 'Please fill in all required fields.' }, { status: 400 })
      : errorPage(400);
  }

  try {
    await sendEmail(fields);
  } catch (err) {
    console.error('Enquiry email failed:', err);
    return wantsJson ? Response.json({ ok: false, error: 'Could not send message' }, { status: 502 }) : errorPage(502);
  }

  if (wantsJson) return Response.json({ ok: true });
  return Response.redirect(redirectTarget(request, form), 303);
}

// Same behaviour as send-enquiry.php on failure.
function errorPage(status: number) {
  return new Response("<script>alert('❌ Error sending message'); window.history.back();</script>", {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
