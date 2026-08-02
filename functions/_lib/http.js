const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com https://*.cloudflareinsights.com; upgrade-insecure-requests",
};

export function withSecurityHeaders(response) {
  const secured = new Response(response.body, response);
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    if (!secured.headers.has(name)) secured.headers.set(name, value);
  });
  return secured;
}

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return withSecurityHeaders(new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  }));
}

export function methodNotAllowed(allowedMethods) {
  const allow = Array.isArray(allowedMethods) ? allowedMethods.join(', ') : allowedMethods;
  return jsonResponse({ error: 'Method not allowed.' }, 405, { Allow: allow });
}

function clientFingerprint(request) {
  const ip = request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
  const userAgent = (request.headers.get('User-Agent') || 'unknown').slice(0, 200);
  return `${ip}|${userAgent}`;
}

async function shortHash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest).slice(0, 12), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function checkRateLimit(context, options) {
  const { env, request } = context;
  const { name, limit, windowSeconds } = options;
  if (!env.PORTFOLIO_KV) return { allowed: true, remaining: null };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSeconds / windowSeconds);
  const retryAfter = windowSeconds - (nowSeconds % windowSeconds);

  try {
    const fingerprint = await shortHash(clientFingerprint(request));
    const key = `rate:${name}:${bucket}:${fingerprint}`;
    const current = Number.parseInt(await env.PORTFOLIO_KV.get(key) || '0', 10);
    if (current >= limit) return { allowed: false, retryAfter, remaining: 0 };

    await env.PORTFOLIO_KV.put(key, String(current + 1), {
      expirationTtl: Math.max(60, windowSeconds + 60),
    });
    return { allowed: true, retryAfter, remaining: Math.max(0, limit - current - 1) };
  } catch (error) {
    console.error(`Rate limit check failed for ${name}:`, error?.message || 'unknown error');
    return { allowed: true, remaining: null };
  }
}

export function rateLimitResponse(result) {
  return jsonResponse(
    { error: 'Request rate limit reached. Please try again later.' },
    429,
    { 'Retry-After': String(result.retryAfter || 60) },
  );
}
