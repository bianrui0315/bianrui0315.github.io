/**
 * Site-wide visitor logging for HTML page views.
 *
 * Cloudflare Pages binding:
 *   DB : D1 Database binding
 *
 * D1 table:
 *   visitor_logs(id, ip, path, country, region, city, user_agent, created_at)
 */

function shouldLogRequest(request, response) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname === '/admin/visitors.html') return false;

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/html');
}

function getVisitorIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

async function logVisit(request, env) {
  if (!env.DB) return;

  const url = new URL(request.url);
  const cf = request.cf || {};
  const ip = getVisitorIp(request).slice(0, 64);
  const path = `${url.pathname}${url.search}`.slice(0, 500);
  const country = (request.headers.get('CF-IPCountry') || cf.country || '').slice(0, 8);
  const region = (cf.region || cf.regionCode || '').slice(0, 100);
  const city = (cf.city || '').slice(0, 100);
  const userAgent = (request.headers.get('User-Agent') || '').slice(0, 500);
  const createdAt = new Date().toISOString();

  if (!ip) return;

  await env.DB.prepare(
    `INSERT INTO visitor_logs (ip, path, country, region, city, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(ip, path, country, region, city, userAgent, createdAt).run();

  await env.DB.prepare(
    `DELETE FROM visitor_logs
     WHERE id NOT IN (
       SELECT id FROM visitor_logs
       ORDER BY created_at DESC
       LIMIT 200
     )`
  ).run();
}

export async function onRequest(context) {
  const response = await context.next();

  if (shouldLogRequest(context.request, response)) {
    const task = logVisit(context.request, context.env).catch(() => {});
    if (typeof context.waitUntil === 'function') {
      context.waitUntil(task);
    } else {
      await task;
    }
  }

  return response;
}
