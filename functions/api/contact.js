import {
  checkRateLimit,
  jsonResponse,
  methodNotAllowed,
  rateLimitResponse,
} from '../_lib/http.js';

/**
 * POST /api/contact
 *
 * Bindings:
 *   DB             : D1 Database binding used to store messages
 *   RESEND_API_KEY : Optional Resend secret used for email notification
 *   PORTFOLIO_KV   : KV namespace used for lightweight abuse control
 */

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isSameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

async function parseJsonBody(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) throw new Error('UNSUPPORTED_MEDIA');

  const declaredLength = Number.parseInt(request.headers.get('Content-Length') || '0', 10);
  if (declaredLength > 12_000) throw new Error('TOO_LARGE');

  const raw = await request.text();
  if (raw.length > 12_000) throw new Error('TOO_LARGE');
  return JSON.parse(raw);
}

async function storeMessage(env, values) {
  if (!env.DB) return false;
  const result = await env.DB.prepare(
    'INSERT INTO contacts (name, email, message, created_at) VALUES (?, ?, ?, ?)'
  ).bind(values.name, values.email, values.message, values.timestamp).run();
  return result?.success !== false;
}

async function sendNotification(env, values) {
  if (!env.RESEND_API_KEY) return false;

  const safeName = escapeHtml(values.name);
  const safeEmail = escapeHtml(values.email);
  const safeMessage = escapeHtml(values.message).replace(/\n/g, '<br>');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: ['bianrui0315@gmail.com'],
      reply_to: values.email,
      subject: `Portfolio contact from ${values.name}`,
      html: `<h2>New Message from Portfolio</h2>
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
<p><strong>Message:</strong><br>${safeMessage}</p>
<p style="color:#666;font-size:12px;">Received ${values.timestamp}</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
  return true;
}

async function handlePost(context) {
  const { request, env } = context;
  if (!isSameOrigin(request)) return jsonResponse({ error: 'Cross-origin submissions are not accepted.' }, 403);

  const rateLimit = await checkRateLimit(context, {
    name: 'contact',
    limit: 5,
    windowSeconds: 3600,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body;
  try {
    body = await parseJsonBody(request);
  } catch (error) {
    if (error.message === 'UNSUPPORTED_MEDIA') return jsonResponse({ error: 'Content-Type must be application/json.' }, 415);
    if (error.message === 'TOO_LARGE') return jsonResponse({ error: 'Request body is too large.' }, 413);
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  if (String(body.website || '').trim()) return jsonResponse({ success: true });

  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 800) {
    return jsonResponse({ error: 'Please wait a moment and try again.' }, 400);
  }

  const name = String(body.name || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 2000);
  if (!name || !email || !message) {
    return jsonResponse({ error: 'Name, email, and message are required.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
  }
  if (!env.DB && !env.RESEND_API_KEY) {
    return jsonResponse({ error: 'Contact delivery is temporarily unavailable. Please email Rui directly.' }, 503);
  }

  const values = { name, email, message, timestamp: new Date().toISOString() };
  let stored = false;
  let emailed = false;

  if (env.DB) {
    try {
      stored = await storeMessage(env, values);
    } catch (error) {
      console.error('Contact D1 write failed:', error?.message || 'unknown error');
    }
  }

  if (env.RESEND_API_KEY) {
    try {
      emailed = await sendNotification(env, values);
    } catch (error) {
      console.error('Contact email delivery failed:', error?.message || 'unknown error');
    }
  }

  if (!stored && !emailed) {
    return jsonResponse({ error: 'Message could not be delivered. Please email bianrui0315@gmail.com directly.' }, 503);
  }

  return jsonResponse({ success: true });
}

export function onRequest(context) {
  if (context.request.method !== 'POST') return methodNotAllowed('POST');
  return handlePost(context);
}
