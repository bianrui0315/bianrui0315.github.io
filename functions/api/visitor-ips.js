/**
 * GET /api/visitor-ips
 *
 * Returns visitor records plus private dashboard stats.
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

function parseVisitor(userAgent = '') {
  const ua = userAgent || '';

  let browser = 'Unknown';
  if (/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless/i.test(ua)) browser = 'Bot / crawler';
  else if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/OPR\//.test(ua)) browser = 'Opera';
  else if (/DuckDuckGo\//.test(ua)) browser = 'DuckDuckGo';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad|iPod/.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Linux/.test(ua)) os = 'Linux';

  let device = 'Desktop';
  if (/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless/i.test(ua)) device = 'Bot / crawler';
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';
  else if (/Mobile|iPhone|Android/i.test(ua)) device = 'Mobile';

  const isBot = device === 'Bot / crawler' || browser === 'Bot / crawler';
  return { browser, os, device, isBot };
}

function topCounts(rows, keyFn, limit = 5) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts, ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function buildHourlyTrend(rows) {
  const buckets = new Map();
  for (const row of rows) {
    if (!row.created_at) continue;
    const date = new Date(row.created_at);
    if (Number.isNaN(date.getTime())) continue;
    date.setMinutes(0, 0, 0);
    const key = date.toISOString();
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return Array.from(buckets, ([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .slice(-24);
}

function buildInsights(rows, enrichedRows, summary, tops) {
  const insights = [];
  const busiestPage = tops.pages[0];
  const topLocation = tops.locations[0];
  const topBrowser = tops.browsers[0];
  const botShare = summary.totalVisits
    ? Math.round((summary.botVisits / summary.totalVisits) * 100)
    : 0;

  if (busiestPage) {
    insights.push(`${busiestPage.label} is the most viewed content in the retained log window (${busiestPage.count} visits).`);
  }
  if (topLocation && topLocation.label !== 'Unknown') {
    insights.push(`${topLocation.label} is the top visitor location signal (${topLocation.count} visits).`);
  }
  if (topBrowser && topBrowser.label !== 'Unknown') {
    insights.push(`${topBrowser.label} is the most common browser (${topBrowser.count} visits).`);
  }
  if (summary.uniqueVisitors > 1) {
    insights.push(`${summary.uniqueVisitors} unique IPs appear in the latest ${summary.totalVisits} retained visits.`);
  }
  if (botShare >= 25) {
    insights.push(`Bot or crawler traffic is elevated at about ${botShare}% of retained visits.`);
  }

  const suspicious = rows.find(row => /\$%7B|%7D|\$\{/.test(row.path || ''));
  if (suspicious) {
    insights.push(`A malformed path such as ${suspicious.path} likely came from a bot, scanner, or broken template link.`);
  }

  const latest = enrichedRows[0];
  if (latest) {
    insights.push(`Latest public page visit: ${latest.path} from ${latest.location || 'unknown location'} using ${latest.browserLabel}.`);
  }

  return insights.slice(0, 6);
}

function buildDashboard(rows) {
  const enrichedRows = rows.map(row => {
    const parsed = parseVisitor(row.user_agent);
    const location = [row.city, row.region, row.country].filter(Boolean).join(', ');
    return {
      ...row,
      location,
      browser: parsed.browser,
      os: parsed.os,
      device: parsed.device,
      isBot: parsed.isBot,
      browserLabel: parsed.os === 'Unknown' ? parsed.browser : `${parsed.browser} / ${parsed.os}`,
    };
  });

  const uniqueIps = new Set(rows.map(row => row.ip).filter(Boolean));
  const timestamps = rows
    .map(row => new Date(row.created_at))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  const summary = {
    totalVisits: rows.length,
    uniqueVisitors: uniqueIps.size,
    botVisits: enrichedRows.filter(row => row.isBot).length,
    mobileVisits: enrichedRows.filter(row => row.device === 'Mobile').length,
    firstSeen: timestamps[0]?.toISOString() || null,
    lastSeen: timestamps[timestamps.length - 1]?.toISOString() || null,
  };

  const tops = {
    pages: topCounts(rows, row => row.path),
    locations: topCounts(enrichedRows, row => row.location),
    countries: topCounts(rows, row => row.country),
    browsers: topCounts(enrichedRows, row => row.browser),
    operatingSystems: topCounts(enrichedRows, row => row.os),
    devices: topCounts(enrichedRows, row => row.device),
    ips: topCounts(rows, row => row.ip, 10),
  };

  return {
    visitors: enrichedRows.slice(0, 10),
    summary,
    tops,
    hourlyTrend: buildHourlyTrend(rows),
    insights: buildInsights(rows, enrichedRows, summary, tops),
  };
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
       WHERE path NOT LIKE '/admin%'
       ORDER BY created_at DESC
       LIMIT 200`
    ).all();

    return jsonResponse(buildDashboard(result.results || []));
  } catch {
    return jsonResponse({
      error: 'Visitor log table is not initialized.',
      setup: 'Create the visitor_logs table in Cloudflare D1.',
    }, 503);
  }
}
