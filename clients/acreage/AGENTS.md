# The Acreage website — brief for an agent working on type and style

You are working on a live client website for The Acreage, an event venue and
restaurant on the Randjesfontein racecourse in Midrand, South Africa. The client
is Jade Mann. The job in hand is **typography and visual style**.

---

## 1. Which folder is real

You are in `D:\Mission Control\JCE Media\reports\researchandreporting\clients\acreage\`.
**This is the live one.**

There is a second clone of the same git repo at `D:\researchandreporting\`.
**It is stale and must not be used.** It is weeks behind and has none of the
current work. If you find yourself editing a path that starts `D:\researchandreporting\`,
stop.

## 2. What is in here

| Folder | What it is | Touch it? |
|---|---|---|
| `website-v7/` | **The live build. All style work happens here.** Three pages: `index.html` (home), `restaurant.html`, `functions.html` | **Yes** |
| `website-v7-fonts/` | Ten type pairings, each a full copy of the homepage with only the type changed, plus a comparison board at `index.html` | Yes, if adding pairings |
| `website-v7-review/` | Commentable copies sent to the client. **Generated** from `website-v7` | **No.** Never hand-edit |
| `website-final/`, `website-v2..v6/`, `website/` | Superseded versions kept for reference | **No** |
| `offers/`, `brand/`, `shoot-brief/`, `visuals/`, `blueprint/` | Other client deliverables, unrelated to the site | No |

Each of the three pages is **a single self-contained HTML file** with all its CSS
in one `<style>` block and its JS in one `<script>` block. There is no build step
and no framework. Images live in `website-v7/assets/`.

## 3. How the type is set up

Design tokens are CSS custom properties on `:root`, near the top of each page.
The three pages carry **their own copies** of the stylesheet, so any token or
rule change must be applied to all three or they will drift.

Current type, which is what was originally signed off:

- **Display** `'Playfair Display SC',Georgia,serif` — h1, h2, h3, nav panel links,
  large figures. Small caps, so it wants `line-height:.99` and `letter-spacing:-.03em`
- **Italic** `'Playfair Display',Georgia,serif` — used wherever a rule also sets
  `font-style:italic` (`.em`, `.atmos p`, `.tcard .qm`)
- **Body** `'Karla',system-ui,-apple-system,sans-serif` at 17px / 1.7

Loaded from one Google Fonts `<link>` per page. If you change a family, change
the link too or it will silently fall back to Georgia.

**The client has not chosen a font yet.** Ten pairings are already built and
published at `/clients/acreage/website-v7-fonts/`. Read
`../../../../clients/Acreage/website/2026-09-23-v7-font-options-generator.py`
before adding more — it derives each script's size and leading from measured
glyph ink rather than guesswork, and that method matters (see §6).

## 4. The brand constraints are the client's own words

Read `D:\Mission Control\JCE Media\clients\Acreage\data\2026-09-21-pos-and-brand\THE-ACREAGE-BRAND-FOUNDATION.docx`
before making style decisions. It is a 25-section document Jade wrote. The parts
that bind hardest:

- **Contemporary country elegance.** Never rustic, never farmhouse, never
  equestrian-themed.
- **Never a golf club or country club.** She names deep green plus warm gold plus
  landscape plus sporting context as the exact trap to avoid.
- **Green sparingly.** Green should carry headings, not backgrounds. White, light
  and negative space must do real work. Gold with restraint.
- **Light, sun-drenched, subtly feminine.** Graceful and editorial, not pink or
  floral. Never dark, masculine or moody luxury.
- **Script type is a selective signature**, used alongside a restrained primary
  face — not everywhere.

## 5. Publishing

The repo root is `D:\Mission Control\JCE Media\reports\researchandreporting\`.
Commit and push to `origin main`. **The push is the publish** — Netlify deploys
in about a minute to `jcereports.netlify.app`. There is no separate deploy step.

After changing `website-v7`, regenerate the client review copies with
`D:\Mission Control\JCE Media\clients\Acreage\website\2026-09-28-build-review-copies.py`.
It rewrites the three pages only and leaves `notes.css`, `notes.js` and
`notes.html` alone.

## 6. How verification goes wrong here

These cost real time on this project. They are not hypothetical.

- **Never verify by forcing the state you are testing.** Scroll-reveal elements
  start at `opacity:0`. Switching them on before measuring hid a bug that left
  57 blocks invisible on the live homepage.
- **Lazy images that are off screen report `complete === false`, not failed.** A
  broken asset went unnoticed for days. Set `loading='eager'`, wait, then count
  `complete && !naturalWidth`.
- **Box overlap is not ink overlap.** Script fonts have huge line boxes. Measure
  real extents with canvas `TextMetrics.actualBoundingBoxAscent/Descent`.
- **Changing a section from a dark ground to a light one means changing every
  inner colour token**, not just the background and the heading. Missing this
  left the address, opening hours and every review at contrast 1.0.
- **Parse the page JS before publishing** (`new Function(...)` over each
  `<script>`). A truncated edit once shipped a page that threw on load and
  rendered nothing but its loading curtain.

## 7. House rules

- **No em dashes** in anything client-facing.
- Client documents carry no internal commercial mechanics.
- Do not embed Canyon or Pinklatte. They are personal-use-only demo fonts.
- Commit messages end with the co-author line used elsewhere in this repo.

## 8. Fuller context

`D:\Mission Control\JCE Media\clients\Acreage\HANDOVER.md` is the single best
orientation document: every live link, what is blocked on the client, and the
open recommendations. Read it if you need more than the type brief above.
