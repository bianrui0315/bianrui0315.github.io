import { jsonResponse, methodNotAllowed } from '../_lib/http.js';

/**
 * GET /api/download-resume           — increments counter, redirects to PDF
 * GET /api/download-resume?stats=1   — returns { count: N } without redirecting
 *
 * Cloudflare Pages Function — required bindings:
 *   PORTFOLIO_KV : KV Namespace binding
 */

const RESUME_PATH = '/assets/cv/Rui_Bian_AI_Data_Software_Engineer.pdf';
const KV_KEY      = 'resume_download_count';

async function handleGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.searchParams.get('stats') === '1') {
    const raw   = env.PORTFOLIO_KV ? await env.PORTFOLIO_KV.get(KV_KEY) : null;
    const count = raw ? parseInt(raw, 10) : 0;
    return jsonResponse({ count });
  }

  if (env.PORTFOLIO_KV) {
    try {
      const raw = await env.PORTFOLIO_KV.get(KV_KEY);
      const current = raw ? parseInt(raw, 10) : 0;
      await env.PORTFOLIO_KV.put(KV_KEY, String(current + 1));
    } catch (error) {
      console.error('Resume counter update failed:', error?.message || 'unknown error');
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}${RESUME_PATH}`,
      'Cache-Control': 'no-store',
    },
  });
}

export function onRequest(context) {
  if (context.request.method !== 'GET') return methodNotAllowed('GET');
  return handleGet(context);
}
