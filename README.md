# bianrui.net — Portfolio Site

Personal portfolio for **Rui Bian, PhD** — Founding AI & Data Engineer focused on AI-powered data software, production ML systems, and backend data platforms.
Deployed at [bianrui.net](https://bianrui.net).

---

## Stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| Static frontend | HTML · CSS · Vanilla JS |
| Serverless backend | Cloudflare Pages Functions (ES modules) |
| AI chatbot | Cloudflare Workers AI — `@cf/meta/llama-3.1-8b-instruct-fast` |
| Email notifications | Resend API |
| Storage | Cloudflare KV (download counter, cache, and abuse controls) |
| Database | Cloudflare D1 SQLite (contact form CRM + private visitor logs) |
| Fonts | Google Fonts — Inter + Playfair Display |
| Icons | Locally vendored Lucide |

---

## Features

### AI Resume Chatbot (`/api/chat`)
- Powered by **Llama 3.1 8B** through a Cloudflare Workers AI binding
- Portfolio-grounded system prompt covering current work, flagship systems, public products, design principles, publications, certifications, and recommendations
- Multi-turn conversation with a bounded recent history and server-side input limits
- Responsive bottom-right launcher, keyboard-accessible dialog, free-text input, and quick prompts

### AI-Readable Professional Profile (`/llms.txt`)
- Recruiter-focused professional summary for AI assistants and crawlers
- Links to canonical portfolio, engineering log, resume, GitHub, LinkedIn, and Scholar sources
- Exposes verified role fit, evidence, technical strengths, LinkedIn recommendations, publications, and contact information

### Professional Recommendations
- Homepage 2×2 section with 2026 LinkedIn recommendations from Rui's University of Delaware PhD advisor, Expatiate Communications' then-CTO, and two Expatiate colleagues
- Highlights AI/data software, software engineering, AI/ML, leadership, ownership, and measurable business impact

### Contact Form (`/api/contact`)
- Validates submissions, applies a honeypot and lightweight KV rate limit, and rejects cross-origin requests
- Stores messages in **Cloudflare D1** and can send notifications through **Resend**
- Reports success only when at least one configured delivery channel succeeds
- Server-side HTML escaping prevents injection in email notifications

### Resume Download Tracking (`/api/download-resume`)
- `GET /api/download-resume` — increments counter in KV, redirects to PDF
- `GET /api/download-resume?stats=1` — returns `{ count: N }` JSON
- Download count displayed live near both resume buttons

### Private Visitor Dashboard (`/admin/visitors.html`)
- Records successful public HTML page visits through Cloudflare Pages middleware into D1; admin/API paths and Global Privacy Control requests are excluded
- Retains the latest 200 records and shows the latest 10 plus summary metrics, page/location/browser/device rankings, hourly trends, and generated insights
- Protected by `VISITOR_STATS_TOKEN`, supplied only through the `x-admin-token` request header

### Engineering Log and Case Studies
- Three visual case studies for the AI workflow orchestration platform, California School Explorer, and Free Image Tools
- A filterable Engineering Log documenting 36 systems and products across backend software, AI/ML, data engineering, compliance, automation, BI, and public products
- Private prototypes are clearly labeled; the site does not advertise a public repository when source code is private

### Reliability, Privacy, and SEO
- Clean canonical URLs, sitemap, `llms.txt`, structured data, custom social cards, redirects, and a no-index custom 404 page
- Dark/light themes, responsive drawer navigation, reduced-motion support, accessible focus states, and local icon assets
- Security headers, JSON API errors, method restrictions, bounded request bodies, and soft KV rate limits
- Public privacy notice describing visitor telemetry, contact storage, AI processing, and local preferences

---

## Cloudflare Pages Setup

### Required Bindings (Pages → Settings → Functions → Bindings)

| Type | Variable Name | Notes |
|---|---|---|
| Workers AI | `AI` | Workers AI binding used by `/api/chat` |
| KV Namespace | `PORTFOLIO_KV` | Create namespace `portfolio-kv` |
| D1 Database | `DB` | Create database, run schema below |
| Secret | `RESEND_API_KEY` | Optional email delivery channel |
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
├── privacy.html                # Public data and privacy notice
├── 404.html                    # Custom no-index error page
├── llms.txt                    # AI-readable recruiter profile
├── sitemap.xml                 # Canonical public URLs
├── _headers                    # Cache and security headers
├── _redirects                  # Legacy-to-canonical redirects
├── _routes.json                # Pages Functions routing boundaries
├── css/
│   └── premium.css             # Responsive dark/light design system
├── functions/
│   ├── _middleware.js          # Logs HTML page visits to D1
│   ├── _lib/http.js            # Shared headers, JSON, and rate limiting
│   └── api/
│       ├── chat.js             # POST /api/chat — AI chatbot (Workers AI)
│       ├── contact.js          # POST /api/contact — contact form + email
│       ├── download-resume.js  # GET  /api/download-resume — tracking + redirect
│       ├── visitor-ips.js      # GET /api/visitor-ips — private visitor dashboard data
│       └── [[path]].js         # JSON 404 for unknown API routes
├── admin/
│   └── visitors.html           # Private visitor analytics dashboard
├── scripts/
│   └── build_resume.py         # Reproducible ATS-friendly resume builder
└── assets/
    ├── cv/                     # Current resume PDF
    ├── img/                    # Site, company, school, project, and OG images
    ├── js/                     # Shared UI and page behavior
    └── vendor/                 # Vendored Lucide runtime and license
```

---

## Local Development

Cloudflare Pages Functions require Wrangler for local testing:

```bash
npx wrangler pages dev . --port 8788 --compatibility-date=2026-08-02
```

Static pages work with any local server. Without Cloudflare bindings, the UI still renders and the APIs return explicit configuration or delivery errors for their unavailable capabilities.
