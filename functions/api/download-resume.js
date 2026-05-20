/**
 * GET /api/download-resume           — increments counter, redirects to PDF
 * GET /api/download-resume?stats=1   — returns { count: N } without redirecting
 *
 * Cloudflare Pages Function — required bindings:
 *   PORTFOLIO_KV : KV Namespace binding
 */

const RESUME_PATH = '/assets/cv/Ray_Rui_Bian_Data_Scientist.pdf';
const KV_KEY      = 'resume_download_count';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.searchParams.get('stats') === '1') {
    const raw   = env.PORTFOLIO_KV ? await env.PORTFOLIO_KV.get(KV_KEY) : null;
    const count = raw ? parseInt(raw, 10) : 0;
    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  if (env.PORTFOLIO_KV) {
    const raw     = await env.PORTFOLIO_KV.get(KV_KEY);
    const current = raw ? parseInt(raw, 10) : 0;
    await env.PORTFOLIO_KV.put(KV_KEY, String(current + 1));
  }

  return Response.redirect(`${url.origin}${RESUME_PATH}`, 302);
}
