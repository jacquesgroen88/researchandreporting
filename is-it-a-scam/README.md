# Is It A Scam?

> Look it up before you pay.

A free, plain-language library of scams. Every scam has a **threat scorecard**, the
**red flags** that give it away, a step-by-step breakdown of how it actually runs, and
**what to do if it has already happened to you** — plus a slot for a video walkthrough.

Built as a static site with **zero dependencies**. Node reads JSON out of `data/`
and writes a complete, crawlable site into `public/`. No framework, no build
toolchain, nothing to keep patched.

**Currently: 32 scams, 10 categories, 20 ranked for South Africa.**

---

## Run it

```bash
npm run build     # generate public/
npm run serve     # build, then serve on http://localhost:8080
```

That's it. There is nothing to install.

---

## Why it is built this way

The whole distribution strategy is organic search, so the architecture follows
from that:

- **Every page is real, pre-rendered HTML** with its own `<title>`, meta
  description, canonical URL and structured data. Nothing is client-rendered.
- **`Article`, `FAQPage` and `HowTo` JSON-LD** on every scam page, which is what
  earns FAQ and how-to rich results.
- **Pretty URLs** (`/scams/sim-swap-fraud/`) and a generated `sitemap.xml`.
- **Content is keyed to how people actually search** — "is this bank sms real",
  "sim swap scam south africa" — not to industry vocabulary.
- **JavaScript only ever hides things.** With JS off, all 32 scams are still on
  the library page and still crawlable. Search is progressive enhancement.
- **No `noindex` header.** Worth stating explicitly, because the JCE reports site
  this was drafted alongside sets one site-wide.

---

## Adding a scam

Drop one JSON file into `data/scams/` and rebuild. It gets a page, a library
card, a category listing, related-scam links and a sitemap entry automatically.

```bash
cp data/scams/qr-code-scam.json data/scams/my-new-scam.json
# edit it
npm run build
```

The build validates as it goes and fails loudly on a missing required field, an
unknown `category`, or a `related` slug that doesn't exist — so a typo is a build
error, not a broken link in production.

### The shape of a scam file

| Field | Notes |
|---|---|
| `slug` | Must match the filename. Becomes `/scams/<slug>/`. |
| `name`, `aka` | `aka` feeds search, so put the words people actually use in it. |
| `category` | Must be one of the ids in `data/site.json`. |
| `top20Rank` | Optional, `1`–`20`. Presence puts the scam in the SA deck. |
| `summary` | One or two sentences. Used on cards, in meta descriptions and in the deck. |
| `typicalLoss` | `{low, high, currency, note}`. The `note` heads the scorecard section. |
| `scores` | Five values, `1`–`10`. See below. |
| `howItWorks` | `[{step, detail}]`. The deck uses the first sentence of each `detail`. |
| `redFlags` | Written to be checkable in the moment, not in hindsight. |
| `illustrativeCase` | Always labelled as a composite in the UI. See "Honesty rules". |
| `howToProtect` / `ifYouveBeenHit` | Actions, in priority order. |
| `faqs` | `[{q, a}]`. These become the `FAQPage` markup — real questions only. |
| `keywords` | Search intent, one phrase per line of thinking. |
| `related` | Slugs. Validated at build time. |
| `video` | `{youtubeId, title}`. See below. |

### The scorecard

Five dimensions, each scored `1`–`10` by hand, combined into a threat score out
of 100:

| Dimension | Weight | Meaning |
|---|---|---|
| `financialImpact` | 30% | How much a typical victim loses. |
| `prevalence` | 25% | How often it is happening right now in South Africa. |
| `believability` | 20% | How convincing it is to a careful, ordinary person. |
| `recoveryDifficulty` | 15% | How hard the money is to get back. **Higher is worse.** |
| `reach` | 10% | How many people are exposed to it. |

Weights live in `WEIGHTS` in `build.js`. Bands: 80+ severe, 68+ high, 55+
elevated, below that moderate.

---

## Adding a video

Every scam page already has a video section. Until a video exists it shows a
short "in production" note; the moment you set an id it becomes an embed.

```json
"video": { "youtubeId": "dQw4w9WgXcQ", "title": "How a fake bank SMS drains an account" }
```

Embeds use `youtube-nocookie.com` and are lazy-loaded. The CSP in `netlify.toml`
already allows exactly those two YouTube origins and nothing else.

---

## The deck

`/deck/` is a self-contained slide deck of South Africa's top 20 scams — built
from the same JSON, so it can never drift from the site. Any scam with a
`top20Rank` appears in it, ordered by that rank.

- Arrow keys, swipe, or the on-screen controls to navigate. `P` to print.
- Deep-linkable per slide (`/deck/#s7`).
- The print stylesheet lays every slide out one per A4 landscape page, so
  **Print → Save as PDF** in any browser produces the handout.
- A pre-built copy ships at `/downloads/sa-top-20-scams.pdf`. Regenerate it with
  `npm run pdf` after changing deck content (see `scripts/make-pdf.js`).

---

## Honesty rules

These are the editorial constraints the content is written under, and they
matter more than they look — the site's usefulness rests on being trustworthy
about scams:

1. **No invented statistics.** Nothing is attributed to SAPS, SABRIC, the FSCA or
   anyone else unless it is genuinely sourced. Loss ranges are labelled as
   indicative.
2. **Scores are editorial.** Stated plainly on every scorecard and in the footer.
   They exist to let people compare scams at a glance, not to look official.
3. **Illustrative cases are composites**, written to show how a scam runs, and
   labelled as such on the page. They are never presented as reports of specific
   incidents.
4. **No legal or financial advice.** Point people at the bodies that can actually
   help — which is what `/report/` is for.

---

## Structure

```
data/
  site.json            categories, score dimensions, site metadata
  checklist.json       the six questions, hard rules, 30-second test
  resources.json       SA reporting bodies and verification checks
  scams/*.json         one file per scam
src/                   styles.css, deck.css, library.js, deck.js, favicon.svg
assets/                downloadable files (the deck PDF)
scripts/make-pdf.js    optional PDF regeneration
build.js              the whole generator, ~700 lines, no dependencies
public/               generated output (gitignored)
```

## Deploy

Netlify, with `netlify.toml` already configured: build `node build.js`, publish
`public`. Point a domain at it and set `url` in `data/site.json` to match — it
drives canonicals, Open Graph URLs and the sitemap.
