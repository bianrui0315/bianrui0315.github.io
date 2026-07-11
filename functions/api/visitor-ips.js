/**
 * GET /api/visitor-ips
 *
 * Returns the latest 10 visitor IP records for private admin use.
 *
 * Required bindings:
 *   DB                  : D1 Database binding
 *   VISITOR_STATS_TOKEN : Secret used as x-admin-token or ?token=
 */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function getToken(request) {
  const url = new URL(request.url);
  return request.headers.get('x-admin-token') || url.searchParams.get('token') || '';
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.VISITOR_STATS_TOKEN) {
    return jsonResponse({ error: 'Visitor stats token is not configured.' }, 503);
  }

  if (getToken(request) !== env.VISITOR_STATS_TOKEN) {
    return jsonResponse({ error: 'Unauthorized.' }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ error: 'D1 database is not configured.' }, 503);
  }

  try {
    const result = await env.DB.prepare(
      `SELECT ip, path, country, region, city, user_agent, created_at
       FROM visitor_logs
       ORDER BY created_at DESC
       LIMIT 10`
    ).all();

    return jsonResponse({ visitors: result.results || [] });
  } catch {
    return jsonResponse({
      error: 'Visitor log table is not initialized.',
      setup: 'Create the visitor_logs table in Cloudflare D1.',
    }, 503);
  }
}
