/**
 * POST /api/contact
 *
 * Cloudflare Pages Function — required bindings (set in Pages dashboard):
 *   DB             : D1 Database binding  (optional — stores messages)
 *   RESEND_API_KEY : Secret               (optional — sends email notification)
 *
 * D1 setup — run once in Cloudflare D1 console:
 *   CREATE TABLE IF NOT EXISTS contacts (
 *     id         INTEGER PRIMARY KEY AUTOINCREMENT,
 *     name       TEXT NOT NULL,
 *     email      TEXT NOT NULL,
 *     message    TEXT NOT NULL,
 *     created_at TEXT NOT NULL
 *   );
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const name    = (body.name    || '').trim().slice(0, 100);
  const email   = (body.email   || '').trim().slice(0, 200);
  const message = (body.message || '').trim().slice(0, 2000);

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Name, email, and message are required.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
  }

  const timestamp = new Date().toISOString();

  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, ?)'
      ).bind(name, email, message, timestamp).run();
    } catch {
      // D1 not initialized — skip silently
    }
  }

  if (env.RESEND_API_KEY) {
    const safeName    = escapeHtml(name);
    const safeEmail   = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     'Portfolio Contact <onboarding@resend.dev>',
        to:       ['bianrui0315@gmail.com'],
        reply_to: email,
        subject:  `Portfolio contact from ${name}`,
        html: `<h2>New Message from Portfolio</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
<p><strong>Message:</strong><br>${safeMessage}</p>
<p style="color:#999;font-size:12px;">Received ${timestamp}</p>`,
      }),
    }).catch(() => {});
  }

  return jsonResponse({ success: true });
}
