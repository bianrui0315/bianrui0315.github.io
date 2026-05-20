/**
 * GET /api/github-stats
 * Proxies GitHub API, caches result in KV for 1 hour.
 *
 * Cloudflare Pages Function — required bindings:
 *   PORTFOLIO_KV : KV Namespace binding
 *   GITHUB_TOKEN : Secret (Personal Access Token — optional, raises rate limit to 5000 req/hr)
 */

const GITHUB_USER = 'bianrui0315';
const CACHE_KEY   = 'github_stats_cache';
const CACHE_TTL   = 3600;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':  'application/json',
      'Cache-Control': status === 200 ? 'public, max-age=3600' : 'no-store',
    },
  });
}

export async function onRequestGet(context) {
  const { env } = context;

  if (env.PORTFOLIO_KV) {
    const cached = await env.PORTFOLIO_KV.get(CACHE_KEY);
    if (cached) return jsonResponse(JSON.parse(cached));
  }

  const ghHeaders = {
    Accept:       'application/vnd.github+json',
    'User-Agent': `${GITHUB_USER}-portfolio`,
    ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=15`, { headers: ghHeaders }),
    ]);

    if (!userRes.ok) throw new Error(`GitHub API ${userRes.status}`);

    const [user, repos, events] = await Promise.all([
      userRes.json(),
      reposRes.json(),
      eventsRes.json(),
    ]);

    const langMap = {};
    if (Array.isArray(repos)) {
      for (const r of repos) {
        if (r.language && !r.fork) {
          langMap[r.language] = (langMap[r.language] || 0) + 1;
        }
      }
    }
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ lang, count }));

    const recentCommits = Array.isArray(events)
      ? events
          .filter(e => e.type === 'PushEvent')
          .slice(0, 3)
          .flatMap(e => {
            const repo   = e.repo.name.replace(`${GITHUB_USER}/`, '');
            const commit = e.payload.commits?.[0];
            return commit
              ? [{ repo, message: commit.message.split('\n')[0].slice(0, 72), date: e.created_at }]
              : [];
          })
      : [];

    const stats = {
      public_repos:  user.public_repos  ?? 0,
      followers:     user.followers     ?? 0,
      topLanguages,
      recentCommits,
      fetched_at: new Date().toISOString(),
    };

    if (env.PORTFOLIO_KV) {
      await env.PORTFOLIO_KV.put(CACHE_KEY, JSON.stringify(stats), { expirationTtl: CACHE_TTL });
    }

    return jsonResponse(stats);
  } catch {
    return jsonResponse({ error: 'Failed to fetch GitHub stats.' }, 502);
  }
}
