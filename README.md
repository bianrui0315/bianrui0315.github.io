# bianrui.net — Portfolio Site

Personal portfolio for **Rui Bian, PhD** — incoming Founding AI & Data Engineer focused on AI-powered data software, production ML systems, and backend data platforms.
Deployed at [bianrui.net](https://bianrui.net).

---

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| Static frontend | HTML · CSS · Vanilla JS |
| Serverless backend | Cloudflare Pages Functions (ES modules) |
| AI chatbot | Cloudflare Workers AI — `@cf/meta/llama-3.1-8b-instruct` |
| Email notifications | Resend API |
| Storage | Cloudflare KV (download counter + GitHub stats cache) |
| Database | Cloudflare D1 SQLite (contact form CRM + private visitor logs) |
| Fonts | Google Fonts — Inter + Playfair Display |
| Icons | Font Awesome 6 |

---

## Features

### AI Resume Chatbot (`/api/chat`)
- Powered by **Llama 3.1 8B** via Cloudflare Workers AI — no third-party API key needed
- Full resume system prompt: flagship systems, public product, design principles, publications, certifications
- Multi-turn conversation with history (last 6 messages sent per request)
- Floating pill button with pulsing online indicator; free-text input + quick-suggest chips

### AI-Readable Professional Profile (`/llms.txt`)
- Recruiter-focused professional summary for AI assistants and crawlers
- Links to canonical portfolio, engineering log, resume, GitHub, LinkedIn, and Scholar sources
- Exposes verified role fit, evidence, technical strengths, LinkedIn recommendations, publications, and contact information

### Professional Recommendations
- Homepage section with 2026 LinkedIn recommendations from a PhD co-advisor, teammates, and a direct manager
- Highlights AI/data software, software engineering, AI/ML, leadership, ownership, and measurable business impact

### Contact Form (`/api/contact`)
- Validates and stores submissions in **Cloudflare D1** (SQLite)
- Sends instant email notification via **Resend API**
- Server-side HTML escaping prevents injection in email body

### Resume Download Tracking (`/api/download-resume`)
- `GET /api/download-resume` — increments counter in KV, redirects to PDF
- `GET /api/download-resume?stats=1` — returns `{ count: N }` JSON
- Download count displayed live near both resume buttons

### GitHub Live Stats (`/api/github-stats`)
- Proxies GitHub API with optional token stored as Cloudflare secret
- Returns top languages (bar chart) + recent public commits
- Cached in KV for 1 hour to avoid rate limits

### Private Visitor Dashboard (`/admin/visitors.html`)
- Records HTML page visits through Cloudflare Pages middleware into D1
- `GET /api/visitor-ips` returns the latest 10 visitor records plus retained-window summary stats, page/location/browser/device rankings, hourly trend data, and generated insights
- Protected by `VISITOR_STATS_TOKEN`; do not expose this token publicly

### Dynamic Project Gallery
- 17 cards: backend systems · production ML platforms · automation infrastructure · public products/MVPs · published papers · in-progress research
- Filter tags with icons: All · Backend/Infrastructure · AI/LLM · ML · Data Engineering · Automation · Go · Product · Visualization · Research
- Staggered fade-in (45ms per card) with spring easing; scale-out on hide

---

## Cloudflare Pages Setup

### Required Bindings (Pages → Settings → Functions → Bindings)

| Type | Variable Name | Notes |
|---|---|---|
| Workers AI | `AI` | Enable in dashboard — free 10K req/day |
| KV Namespace | `PORTFOLIO_KV` | Create namespace `portfolio-kv` |
| D1 Database | `DB` | Create database, run schema below |
| Secret | `RESEND_API_KEY` | Free at resend.com — 3000 emails/month |
| Secret | `GITHUB_TOKEN` | PAT with `public_repo` read scope (optional) |
| Secret | `VISITOR_STATS_TOKEN` | Private token for `/admin/visitors.html` |

### D1 Schema

Run once in **D1 Console** (dashboard → D1 → your database → Console tab):

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visitor_logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ip         TEXT NOT NULL,
  path       TEXT NOT NULL,
  country    TEXT,
  region     TEXT,
  city       TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
```

### View Contact Submissions

```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

### View Recent Visitor IPs

Open `/admin/visitors.html` and enter `VISITOR_STATS_TOKEN`, or query D1 directly:

```sql
SELECT ip, path, city, region, country, user_agent, created_at
FROM visitor_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## File Structure

```
├── index.html                  # Main portfolio page
├── projects.html               # Full engineering log
├── llms.txt                    # AI-readable recruiter profile
├── css/
│   └── premium.css             # Main stylesheet (dark theme)
├── functions/
│   ├── _middleware.js          # Logs HTML page visits to D1
│   └── api/
│       ├── chat.js             # POST /api/chat — AI chatbot (Workers AI)
│       ├── contact.js          # POST /api/contact — contact form + email
│       ├── download-resume.js  # GET  /api/download-resume — tracking + redirect
│       ├── github-stats.js     # GET  /api/github-stats — GitHub API proxy
│       └── visitor-ips.js      # GET  /api/visitor-ips — private visitor dashboard data
├── admin/
│   └── visitors.html           # Private visitor analytics dashboard
└── assets/
    ├── cv/                     # Resume PDFs
    └── img/                    # Images
```

---

## Local Development

Cloudflare Pages Functions require `wrangler` for local testing with bindings:

```bash
npm install -g wrangler
wrangler pages dev . --compatibility-date=2024-01-01
```

Static pages work with any local server (e.g. VS Code Live Server).  
Without bindings, all API endpoints degrade gracefully — the UI still renders.
