# JCE Media — Research & Reports

> A living knowledge base of competitive intelligence, ad research, platform analysis, and strategic reports produced by JCE Media for our clients.

---

## Clients

| Client | Industry | Reports | Last Updated |
|--------|----------|---------|-------------|
| [ReviewTap](./clients/reviewtap/) | NFC/QR Review Products · eCommerce | 1 | May 2026 |

---

## How This Repository Works

### Folder Structure

```
clients/
└── {client-slug}/
    ├── README.md                          ← Client overview, context, links
    └── reports/
        └── {YYYY-MM-DD}-{report-slug}/
            ├── index.html                 ← Primary report (opens in browser)
            ├── README.md                  ← Report summary + methodology
            └── /assets/                   ← Supporting files (optional)
```

### Report Naming Convention

Reports follow `YYYY-MM-DD-{descriptor}` so they sort chronologically and are easy to audit at a glance:

```
2026-05-15-competitor-ad-intelligence
2026-06-01-facebook-funnel-audit
2026-06-15-keyword-gap-analysis
```

### Report Types We Produce

| Type | Description |
|------|-------------|
| **Competitor Ad Intelligence** | Facebook Ad Library scrapes — competitor creatives, copy angles, longevity analysis |
| **Platform Audit** | Account-level review of ad accounts, SEO, social profiles |
| **Keyword & SEO Research** | Organic search landscape, gap analysis, content opportunities |
| **Funnel Analysis** | Landing page, CRO, and conversion path review |
| **Market Research** | Industry trends, audience sizing, platform benchmarks |
| **Creative Swipe File** | Curated ad copy patterns, hooks, and visual frameworks |

### How to View Reports

All primary reports are self-contained HTML files (`index.html`). To view:

1. **Locally** — download the file and open in any browser
2. **GitHub Pages** *(if enabled)* — reports are accessible at:
   `https://jacquesgroen88.github.io/researchandreporting/clients/{client}/reports/{report}/`
3. **Raw GitHub** — navigate into any report folder and click `index.html`

### Adding a New Report

1. Create folder: `clients/{client-slug}/reports/{YYYY-MM-DD}-{slug}/`
2. Drop in `index.html` (the report) and a `README.md` (the summary)
3. Update the client's `README.md` to include the new entry
4. Update this root `README.md` client table (last updated date + report count)
5. Commit with message: `feat({client}): add {report-name} report`

---

## About JCE Media

JCE Media is a South African performance marketing and digital strategy agency. This repository serves as our internal research archive — documenting competitive intelligence and strategic insights we develop for clients over time.

Each report in this repo represents hours of research, data scraping, and strategic analysis. Treat it as a compounding asset: the longer we work with a client, the richer their folder becomes.

---

*Last updated: May 2026 · Maintained by JCE Media*
