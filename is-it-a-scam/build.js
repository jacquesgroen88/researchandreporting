#!/usr/bin/env node
/**
 * Is It A Scam? — static site generator.
 *
 * Zero dependencies. Reads JSON out of data/, writes a complete, crawlable
 * static site into public/. Every page is real HTML with its own title, meta
 * description and structured data, because organic search is the whole point
 * of the project.
 *
 *   node build.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'public');

const site = readJson(path.join(DATA, 'site.json'));
const checklist = readJson(path.join(DATA, 'checklist.json'));
const resources = readJson(path.join(DATA, 'resources.json'));

/* ── Scoring ──────────────────────────────────────────────────────────────
   The threat score is an editorial weighting, not a statistic. Financial
   impact and prevalence dominate because they drive real-world harm; reach
   counts least because a scam everyone sees but nobody falls for is noise. */
const PDF_PATH = '/downloads/sa-top-20-scams.pdf';

const WEIGHTS = {
  financialImpact: 0.30,
  prevalence: 0.25,
  believability: 0.20,
  recoveryDifficulty: 0.15,
  reach: 0.10,
};

function threatScore(scores) {
  let total = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) total += (scores[k] || 0) * w;
  return Math.round(total * 10);
}

function threatBand(score) {
  if (score >= 80) return { id: 'severe', label: 'Severe' };
  if (score >= 68) return { id: 'high', label: 'High' };
  if (score >= 55) return { id: 'elevated', label: 'Elevated' };
  return { id: 'moderate', label: 'Moderate' };
}

/* ── Load and validate scams ─────────────────────────────────────────────── */
const REQUIRED = ['slug', 'name', 'category', 'summary', 'scores', 'howItWorks',
  'redFlags', 'howToProtect', 'ifYouveBeenHit', 'faqs', 'keywords'];

const scams = fs.readdirSync(path.join(DATA, 'scams'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const s = readJson(path.join(DATA, 'scams', f));
    for (const key of REQUIRED) {
      if (!s[key]) throw new Error(`${f}: missing required field "${key}"`);
    }
    if (!site.categories.some((c) => c.id === s.category)) {
      throw new Error(`${f}: unknown category "${s.category}"`);
    }
    s.threat = threatScore(s.scores);
    s.band = threatBand(s.threat);
    s.categoryName = site.categories.find((c) => c.id === s.category).name;
    s.url = `/scams/${s.slug}/`;
    return s;
  })
  .sort((a, b) => b.threat - a.threat);

const bySlug = new Map(scams.map((s) => [s.slug, s]));
for (const s of scams) {
  for (const r of s.related || []) {
    if (!bySlug.has(r)) throw new Error(`${s.slug}: related slug "${r}" does not exist`);
  }
}

const top20 = scams.filter((s) => s.top20Rank).sort((a, b) => a.top20Rank - b.top20Rank);
if (top20.length !== 20) {
  console.warn(`  ! warning: ${top20.length} scams carry a top20Rank, expected 20`);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function write(relPath, html) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  pages.push(relPath);
}

function rands(n) {
  return 'R' + n.toLocaleString('en-ZA');
}

/* Deck slides carry one line per step, so take the first complete sentence
   rather than chopping on a delimiter (which double-punctuated single-sentence
   details and truncated mid-thought). */
function firstSentence(text) {
  const m = text.match(/^([\s\S]*?[.!?])(?:\s|$)/);
  return (m ? m[1] : text).trim();
}

const pages = [];
const sitemapUrls = [];

/* ── Page shell ──────────────────────────────────────────────────────────── */
function layout({ title, description, canonical, body, jsonld = [], bodyClass = '', extraHead = '', script = '' }) {
  const fullTitle = canonical === '/' ? title : `${title} | ${site.name}`;
  sitemapUrls.push(canonical);
  return `<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${site.url}${canonical === '/' ? '' : canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${site.url}${canonical === '/' ? '' : canonical}">
<meta property="og:locale" content="en_ZA">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="theme-color" content="#0d0f13">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/styles.css">
${extraHead}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap head-inner">
    <a class="brand" href="/">
      <span class="brand-mark" aria-hidden="true">?</span>
      <span class="brand-text"><strong>Is It A Scam</strong><span class="brand-q">?</span></span>
    </a>
    <nav class="nav" aria-label="Main">
      <a href="/scams/">Scam library</a>
      <a href="/checklist/">Checklist</a>
      <a href="/deck/">SA Top 20</a>
      <a href="/report/">Report it</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <p class="foot-brand">${esc(site.name)}</p>
        <p class="muted">${esc(site.tagline)}</p>
      </div>
      <div>
        <h2 class="foot-h">Browse</h2>
        <ul class="plain">
          <li><a href="/scams/">All ${scams.length} scams</a></li>
          <li><a href="/checklist/">The universal checklist</a></li>
          <li><a href="/deck/">South Africa's top 20</a></li>
          <li><a href="/report/">Where to report</a></li>
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Categories</h2>
        <ul class="plain">
          ${site.categories.slice(0, 5).map((c) => `<li><a href="/category/${c.id}/">${esc(c.name)}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
    <p class="disclaimer">${esc(site.disclaimerShort)} Nothing here is legal or financial advice. If you have lost money, report it to your bank and the SAPS first.</p>
  </div>
</footer>
${script}
</body>
</html>
`;
}

function breadcrumbs(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: site.url + (t.url === '/' ? '' : t.url),
    })),
  };
}

function crumbHtml(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map((t, i) =>
    i === trail.length - 1
      ? `<li aria-current="page">${esc(t.name)}</li>`
      : `<li><a href="${t.url}">${esc(t.name)}</a></li>`).join('')}</ol></nav>`;
}

/* ── Components ──────────────────────────────────────────────────────────── */
function scoreRing(score, band, size = 'md') {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  return `<div class="ring ring-${size} band-${band.id}" role="img" aria-label="Threat score ${score} out of 100, rated ${band.label}">
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle class="ring-track" cx="50" cy="50" r="42"></circle>
    <circle class="ring-value" cx="50" cy="50" r="42"
      stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
  </svg>
  <div class="ring-inner"><span class="ring-num">${score}</span><span class="ring-band">${esc(band.label)}</span></div>
</div>`;
}

function scoreBars(scores) {
  return `<dl class="bars">
${site.scoreDimensions.map((d) => {
    const v = scores[d.id] || 0;
    return `  <div class="bar-row">
    <dt><span class="bar-name">${esc(d.name)}</span><span class="bar-blurb">${esc(d.blurb)}</span></dt>
    <dd>
      <div class="bar" role="img" aria-label="${esc(d.name)}: ${v} out of 10">
        <span class="bar-fill lvl-${v}" style="width:${v * 10}%"></span>
      </div>
      <span class="bar-val">${v}<span class="bar-max">/10</span></span>
    </dd>
  </div>`;
  }).join('\n')}
</dl>`;
}

function scamCard(s) {
  return `<article class="card band-${s.band.id}" data-slug="${esc(s.slug)}" data-category="${esc(s.category)}" data-threat="${s.threat}" data-search="${esc((s.name + ' ' + (s.aka || []).join(' ') + ' ' + s.summary + ' ' + s.keywords.join(' ')).toLowerCase())}">
  <div class="card-top">
    <span class="cat-tag">${esc(s.categoryName)}</span>
    <span class="threat-chip band-${s.band.id}"><span class="chip-num">${s.threat}</span><span class="chip-lbl">${esc(s.band.label)}</span></span>
  </div>
  <h3><a href="${s.url}">${esc(s.name)}</a></h3>
  <p class="card-sum">${esc(s.summary)}</p>
  <p class="card-meta">Typical loss ${rands(s.typicalLoss.low)} – ${rands(s.typicalLoss.high)}</p>
</article>`;
}

/* ── Home ────────────────────────────────────────────────────────────────── */
function buildHome() {
  const featured = scams.slice(0, 6);
  const body = `
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Free scam intelligence for South Africa</p>
    <h1>Is it a scam?<br><span class="hero-accent">Look it up before you pay.</span></h1>
    <p class="hero-lede">${esc(site.description)}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/scams/">Search ${scams.length} scams</a>
      <a class="btn btn-ghost" href="/checklist/">Use the 6-point checklist</a>
    </div>
    <ul class="hero-stats">
      <li><strong>${scams.length}</strong><span>scams documented</span></li>
      <li><strong>${site.categories.length}</strong><span>categories</span></li>
      <li><strong>20</strong><span>ranked for South Africa</span></li>
      <li><strong>5</strong><span>scored dimensions each</span></li>
    </ul>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="section-head">
      <h2>If it is happening right now</h2>
      <p class="muted">Three things, in this order. Everything else can wait.</p>
    </div>
    <ol class="emergency">
      <li><strong>Stop paying.</strong> There is no final fee. Whatever you have already lost, the next payment does not bring it back.</li>
      <li><strong>Phone your bank's fraud line</strong> using the number on your bank card, not one from any message. Under an hour, recovery is genuinely possible.</li>
      <li><strong>Open a SAPS case</strong> and get a case number. Your bank will ask for it, and it is what makes patterns visible.</li>
    </ol>
    <p class="emergency-foot"><a class="link-arrow" href="/report/">Full reporting guide and who handles what</a></p>
  </div>
</section>

<section class="band band-alt">
  <div class="wrap">
    <div class="section-head">
      <h2>Highest threat right now</h2>
      <p class="muted">Ranked by our threat score: financial impact, prevalence, believability, how hard recovery is, and how many people are exposed.</p>
    </div>
    <div class="grid cards">
${featured.map(scamCard).join('\n')}
    </div>
    <p class="section-foot"><a class="link-arrow" href="/scams/">Browse the full library</a></p>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="section-head">
      <h2>The shape of every scam</h2>
      <p class="muted">You do not need to recognise the specific scam. You need to recognise the machinery, and it is almost always the same six parts.</p>
    </div>
    <div class="grid pillars">
${checklist.pillars.map((p) => `      <a class="pillar" href="/checklist/#${esc(p.id)}">
        <h3>${esc(p.name)}</h3>
        <p class="pillar-principle">${esc(p.principle)}</p>
      </a>`).join('\n')}
    </div>
    <p class="section-foot"><a class="link-arrow" href="/checklist/">Read the full checklist</a></p>
  </div>
</section>

<section class="band band-alt">
  <div class="wrap">
    <div class="section-head">
      <h2>Browse by category</h2>
    </div>
    <div class="grid cats">
${site.categories.map((c) => {
    const n = scams.filter((s) => s.category === c.id).length;
    return `      <a class="cat-card" href="/category/${c.id}/">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.blurb)}</p>
        <span class="cat-count">${n} ${n === 1 ? 'scam' : 'scams'}</span>
      </a>`;
  }).join('\n')}
    </div>
  </div>
</section>

<section class="band cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>South Africa's 20 most active scams</h2>
      <p class="muted">A presentable, printable deck covering each one: how it runs, what gives it away, and what to do. Built for community talks, staff briefings and school sessions.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="/deck/">Open the deck</a>
      <a class="btn btn-ghost" href="${PDF_PATH}" download>Download PDF</a>
    </div>
  </div>
</section>`;

  write('index.html', layout({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    canonical: '/',
    bodyClass: 'page-home',
    body,
    jsonld: [
      {
        '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url,
        description: site.description, inLanguage: 'en-ZA',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/scams/?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org', '@type': 'Organization', name: site.name,
        url: site.url, description: site.description,
      },
    ],
  }));
}

/* ── Library ─────────────────────────────────────────────────────────────── */
function buildLibrary() {
  const trail = [{ name: 'Home', url: '/' }, { name: 'Scam library', url: '/scams/' }];
  const body = `
<div class="wrap">
${crumbHtml(trail)}
<div class="page-head">
  <h1>The scam library</h1>
  <p class="lede">${scams.length} scams, each scored on five dimensions and written so you can identify it in the moment. Search by what happened to you, not by what it is called.</p>
</div>

<div class="filters">
  <div class="search-wrap">
    <label class="sr-only" for="q">Search scams</label>
    <input type="search" id="q" placeholder="Search: bank sms, deposit, whatsapp code, job fee…" autocomplete="off">
  </div>
  <div class="chips" role="group" aria-label="Filter by category">
    <button class="chip is-on" data-cat="all">All</button>
${site.categories.map((c) => `    <button class="chip" data-cat="${esc(c.id)}">${esc(c.name)}</button>`).join('\n')}
  </div>
  <p class="result-count" id="count" aria-live="polite">${scams.length} scams</p>
</div>

<div class="grid cards" id="library">
${scams.map(scamCard).join('\n')}
</div>
<p class="no-results" id="empty" hidden>Nothing matches that. Try a plainer word — "sms", "deposit", "loan", "investment" — or <a href="/checklist/">run the checklist</a> instead.</p>
</div>`;

  write('scams/index.html', layout({
    title: `Scam library: ${scams.length} scams explained and scored`,
    description: `A searchable library of ${scams.length} scams, each with a threat score, the red flags that expose it, how it actually works, and what to do if you have already paid.`,
    canonical: '/scams/',
    bodyClass: 'page-library',
    body,
    script: '<script src="/assets/library.js"></script>',
    jsonld: [
      breadcrumbs(trail),
      {
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: 'Scam library', numberOfItems: scams.length,
        itemListElement: scams.map((s, i) => ({
          '@type': 'ListItem', position: i + 1, name: s.name, url: site.url + s.url,
        })),
      },
    ],
  }));
}

/* ── Category pages ──────────────────────────────────────────────────────── */
function buildCategories() {
  for (const c of site.categories) {
    const list = scams.filter((s) => s.category === c.id);
    if (!list.length) continue;
    const trail = [{ name: 'Home', url: '/' }, { name: 'Scam library', url: '/scams/' }, { name: c.name, url: `/category/${c.id}/` }];
    const body = `
<div class="wrap">
${crumbHtml(trail)}
<div class="page-head">
  <h1>${esc(c.name)} scams</h1>
  <p class="lede">${esc(c.blurb)} ${list.length} documented, scored and ranked by threat.</p>
</div>
<div class="grid cards">
${list.map(scamCard).join('\n')}
</div>
<p class="section-foot"><a class="link-arrow" href="/scams/">Back to the full library</a></p>
</div>`;
    write(`category/${c.id}/index.html`, layout({
      title: `${c.name} scams in South Africa`,
      description: `${c.blurb} ${list.length} ${c.name.toLowerCase()} scams explained, scored and paired with the red flags that give each one away.`,
      canonical: `/category/${c.id}/`,
      bodyClass: 'page-category',
      body,
      jsonld: [breadcrumbs(trail), {
        '@context': 'https://schema.org', '@type': 'ItemList', name: `${c.name} scams`,
        numberOfItems: list.length,
        itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: site.url + s.url })),
      }],
    }));
  }
}

/* ── Scam detail ─────────────────────────────────────────────────────────── */
function buildScamPages() {
  for (const s of scams) {
    const trail = [
      { name: 'Home', url: '/' },
      { name: 'Scam library', url: '/scams/' },
      { name: s.categoryName, url: `/category/${s.category}/` },
      { name: s.name, url: s.url },
    ];
    const related = (s.related || []).map((r) => bySlug.get(r)).filter(Boolean);

    const videoBlock = s.video && s.video.youtubeId
      ? `<section class="sect" id="video">
  <h2>Watch: ${esc(s.video.title)}</h2>
  <div class="video-frame">
    <iframe src="https://www.youtube-nocookie.com/embed/${esc(s.video.youtubeId)}" title="${esc(s.video.title)}"
      loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
</section>`
      : `<section class="sect video-pending" id="video">
  <h2>Video walkthrough</h2>
  <p class="muted">A video breakdown of this scam is in production. When it publishes it will appear here.</p>
</section>`;

    const body = `
<div class="wrap">
${crumbHtml(trail)}
</div>

<article class="scam">
<header class="scam-head band-${s.band.id}">
  <div class="wrap scam-head-inner">
    <div class="scam-head-text">
      <p class="eyebrow"><a href="/category/${s.category}/">${esc(s.categoryName)}</a></p>
      <h1>${esc(s.name)}</h1>
      ${(s.aka || []).length ? `<p class="aka">Also called: ${s.aka.map(esc).join(' · ')}</p>` : ''}
      <p class="lede">${esc(s.summary)}</p>
      <ul class="head-facts">
        <li><span>Typical loss</span><strong>${rands(s.typicalLoss.low)} – ${rands(s.typicalLoss.high)}</strong></li>
        <li><span>Mainly seen in</span><strong>${(s.prevalentIn || ['South Africa']).map(esc).join(', ')}</strong></li>
        ${s.top20Rank ? `<li><span>SA top 20</span><strong>#${s.top20Rank}</strong></li>` : ''}
      </ul>
    </div>
    <div class="scam-head-score">
      ${scoreRing(s.threat, s.band, 'lg')}
      <p class="score-caption">Threat score</p>
    </div>
  </div>
</header>

<div class="wrap scam-body">
<div class="scam-main">

<section class="sect" id="scorecard">
  <h2>The scorecard</h2>
  <p class="sect-lede">${esc(s.typicalLoss.note || '')}</p>
  ${scoreBars(s.scores)}
  <p class="fineprint">Scored 1–10 by our editors and reviewed as the picture changes. Recovery difficulty is inverted: a high score means the money is very hard to get back. This is an editorial assessment to help you compare scams at a glance, not an official statistic.</p>
</section>

<section class="sect" id="red-flags">
  <h2>Red flags</h2>
  <p class="sect-lede">If you are looking at this right now, these are the things to check first.</p>
  <ul class="flags">
${s.redFlags.map((f) => `    <li>${esc(f)}</li>`).join('\n')}
  </ul>
</section>

<section class="sect" id="how-it-works">
  <h2>How it works</h2>
  <ol class="steps">
${s.howItWorks.map((h, i) => `    <li>
      <span class="step-num">${i + 1}</span>
      <div><h3>${esc(h.step)}</h3><p>${esc(h.detail)}</p></div>
    </li>`).join('\n')}
  </ol>
</section>

${s.illustrativeCase ? `<section class="sect" id="example">
  <h2>What it looks like in practice</h2>
  <figure class="case">
    <blockquote><p>${esc(s.illustrativeCase)}</p></blockquote>
    <figcaption>Illustrative composite. Written to show how the scam runs, not a report of a specific incident.</figcaption>
  </figure>
</section>` : ''}

<section class="sect" id="protect">
  <h2>How to protect yourself</h2>
  <ul class="ticks">
${s.howToProtect.map((p) => `    <li>${esc(p)}</li>`).join('\n')}
  </ul>
</section>

<section class="sect urgent" id="if-hit">
  <h2>If this has already happened to you</h2>
  <p class="sect-lede">Work down this list in order. Speed matters more than anything else here.</p>
  <ol class="actions">
${s.ifYouveBeenHit.map((a) => `    <li>${esc(a)}</li>`).join('\n')}
  </ol>
  <p class="section-foot"><a class="link-arrow" href="/report/">Who to report this to in South Africa</a></p>
</section>

${videoBlock}

<section class="sect" id="faq">
  <h2>Questions people ask</h2>
  <div class="faqs">
${s.faqs.map((f) => `    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('\n')}
  </div>
</section>

${related.length ? `<section class="sect" id="related">
  <h2>Related scams</h2>
  <div class="grid cards">
${related.map(scamCard).join('\n')}
  </div>
</section>` : ''}

</div>

<aside class="scam-aside">
  <div class="aside-card">
    <h2>On this page</h2>
    <ul class="plain toc">
      <li><a href="#scorecard">The scorecard</a></li>
      <li><a href="#red-flags">Red flags</a></li>
      <li><a href="#how-it-works">How it works</a></li>
      ${s.illustrativeCase ? '<li><a href="#example">In practice</a></li>' : ''}
      <li><a href="#protect">How to protect yourself</a></li>
      <li><a href="#if-hit">If it has happened</a></li>
      <li><a href="#faq">Questions</a></li>
    </ul>
  </div>
  <div class="aside-card aside-rule">
    <h2>The one rule</h2>
    <p>No bank, retailer, courier or government department will ever ask for your OTP, PIN or password. Not to verify you, not to help you, not to stop a fraud.</p>
    <a class="link-arrow" href="/checklist/">The full checklist</a>
  </div>
</aside>
</div>
</article>`;

    const desc = `${s.summary} Red flags, how it works step by step, a threat scorecard, and what to do if you have already paid.`;
    write(`scams/${s.slug}/index.html`, layout({
      title: `${s.name}: how it works and how to spot it`,
      description: desc.slice(0, 300),
      canonical: s.url,
      bodyClass: 'page-scam',
      body,
      extraHead: `<meta name="keywords" content="${esc(s.keywords.join(', '))}">`,
      jsonld: [
        breadcrumbs(trail),
        {
          '@context': 'https://schema.org', '@type': 'Article',
          headline: `${s.name}: how it works and how to spot it`,
          description: s.summary, inLanguage: 'en-ZA',
          about: { '@type': 'Thing', name: s.name },
          articleSection: s.categoryName,
          publisher: { '@type': 'Organization', name: site.name, url: site.url },
          mainEntityOfPage: { '@type': 'WebPage', '@id': site.url + s.url },
        },
        {
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: s.faqs.map((f) => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        {
          '@context': 'https://schema.org', '@type': 'HowTo',
          name: `How to protect yourself from ${s.name.toLowerCase()}`,
          step: s.howToProtect.map((p, i) => ({ '@type': 'HowToStep', position: i + 1, text: p })),
        },
      ],
    }));
  }
}

/* ── Checklist ───────────────────────────────────────────────────────────── */
function buildChecklist() {
  const trail = [{ name: 'Home', url: '/' }, { name: 'Checklist', url: '/checklist/' }];
  const body = `
<div class="wrap">
${crumbHtml(trail)}
<div class="page-head">
  <h1>${esc(checklist.title)}</h1>
  <p class="lede">${esc(checklist.intro)}</p>
  <p class="print-hint">Tip: print this page, or save it as a PDF, and put it somewhere your family can reach it.</p>
</div>

<section class="sect" id="thirty-second">
  <h2>The 30-second test</h2>
  <p class="sect-lede">When something is happening right now and you have no time to read, do this.</p>
  <ol class="steps steps-tight">
${checklist.thirtySecondTest.map((t, i) => `    <li><span class="step-num">${i + 1}</span><div><h3>${esc(t.step)}</h3><p>${esc(t.detail)}</p></div></li>`).join('\n')}
  </ol>
</section>

<section class="sect" id="pillars">
  <h2>The six questions</h2>
  <p class="sect-lede">Work through these in order. Three or more hits means stop and verify independently before any money or information moves.</p>
  <div class="pillar-list">
${checklist.pillars.map((p) => `    <section class="pillar-block" id="${esc(p.id)}">
      <h3>${esc(p.name)}</h3>
      <p class="pillar-principle">${esc(p.principle)}</p>
      <p>${esc(p.detail)}</p>
      <ul class="checkboxes">
${p.checks.map((c) => `        <li><label><input type="checkbox"> <span>${esc(c)}</span></label></li>`).join('\n')}
      </ul>
    </section>`).join('\n')}
  </div>
</section>

<section class="sect urgent" id="hard-rules">
  <h2>Rules with no exceptions</h2>
  <p class="sect-lede">Everything above requires judgement. These do not. Hold them absolutely and most attacks fail at the first step.</p>
  <ul class="rules">
${checklist.hardRules.map((r) => `    <li>${esc(r)}</li>`).join('\n')}
  </ul>
</section>

<section class="sect" id="next">
  <h2>Still not sure?</h2>
  <p>Look up what is happening to you in the library. Search by what you are seeing — an SMS, a deposit request, a code, a job fee — rather than by what the scam is called.</p>
  <p class="section-foot"><a class="btn btn-primary" href="/scams/">Search the scam library</a></p>
</section>
</div>`;

  write('checklist/index.html', layout({
    title: 'The universal scam checklist: 6 questions that expose almost any scam',
    description: 'Six questions and ten rules with no exceptions. A printable checklist for working out whether something is a scam, before you pay or hand over information.',
    canonical: '/checklist/',
    bodyClass: 'page-checklist',
    body,
    jsonld: [breadcrumbs(trail), {
      '@context': 'https://schema.org', '@type': 'HowTo',
      name: 'How to tell if something is a scam',
      description: checklist.intro,
      step: checklist.pillars.map((p, i) => ({
        '@type': 'HowToStep', position: i + 1, name: p.name, text: p.detail,
      })),
    }],
  }));
}

/* ── Report / resources ──────────────────────────────────────────────────── */
function buildReport() {
  const trail = [{ name: 'Home', url: '/' }, { name: 'Report a scam', url: '/report/' }];
  const body = `
<div class="wrap">
${crumbHtml(trail)}
<div class="page-head">
  <h1>${esc(resources.title)}</h1>
  <p class="lede">${esc(resources.intro)}</p>
</div>

<section class="sect urgent" id="first">
  <h2>Do these first, in this order</h2>
  <ol class="steps steps-tight">
${resources.immediateSteps.map((s) => `    <li><span class="step-num">${s.order}</span><div><h3>${esc(s.action)}</h3><p>${esc(s.detail)}</p></div></li>`).join('\n')}
  </ol>
</section>

<section class="sect" id="bodies">
  <h2>Who handles what</h2>
  <div class="grid bodies">
${resources.bodies.map((b) => `    <article class="body-card">
      <h3>${b.site ? `<a href="${esc(b.site)}" rel="noopener nofollow" target="_blank">${esc(b.name)}</a>` : esc(b.name)}</h3>
      <p class="body-handles">${esc(b.handles)}</p>
      <p class="body-how">${esc(b.how)}</p>
    </article>`).join('\n')}
  </div>
</section>

<section class="sect" id="verify">
  <h2>Verify before you pay</h2>
  <p class="sect-lede">Six checks, all free, most of them under a minute. Between them they stop the majority of what is on this site.</p>
  <div class="verify-list">
${resources.verifyBeforeYouPay.map((v) => `    <div class="verify-row">
      <h3>${esc(v.check)}</h3>
      <p class="verify-where">${esc(v.where)}</p>
      <p>${esc(v.why)}</p>
    </div>`).join('\n')}
  </div>
</section>
</div>`;

  write('report/index.html', layout({
    title: 'Report a scam in South Africa: who to contact and in what order',
    description: 'Been scammed in South Africa? The first six things to do, and exactly which body handles which type of fraud: SAPS, your bank, the FSCA, NCR, SAFPS, the NFO and more.',
    canonical: '/report/',
    bodyClass: 'page-report',
    body,
    jsonld: [breadcrumbs(trail)],
  }));
}

/* ── Deck ────────────────────────────────────────────────────────────────── */
function buildDeck() {
  const trail = [{ name: 'Home', url: '/' }, { name: 'SA Top 20 deck', url: '/deck/' }];

  const cover = `<section class="slide slide-cover" id="s0" aria-label="Cover">
  <div class="slide-inner">
    <p class="deck-eyebrow">Is It A Scam?</p>
    <h1>South Africa's<br>Top 20 Scams</h1>
    <p class="deck-sub">How each one runs, what gives it away, and what to do if it has already happened.</p>
    <p class="deck-meta">A free briefing deck · ${scams.length} scams documented at isitascam.co.za</p>
  </div>
</section>`;

  const howTo = `<section class="slide slide-plain" id="s1" aria-label="How to use this deck">
  <div class="slide-inner">
    <p class="deck-kicker">Before we start</p>
    <h2>How to use this deck</h2>
    <div class="deck-cols">
      <div>
        <h3>The point is not memorisation</h3>
        <p>Twenty scams is too many to remember under pressure. What you are learning is the shape they share, so that scam twenty-one is recognisable the first time you meet it.</p>
        <h3>Every one of these has three parts</h3>
        <p>Contact you did not ask for. Pressure to act before you check. A payment method that cannot be reversed. Watch for those three across all twenty.</p>
      </div>
      <div>
        <h3>The two rules to leave with</h3>
        <p class="deck-rule">Nobody legitimate ever asks for your OTP, PIN or password.</p>
        <p class="deck-rule">You never pay a fee to receive money.</p>
        <h3>Navigate</h3>
        <p class="deck-nav-help">Arrow keys or swipe to move. Press <kbd>P</kbd> or use your browser's print dialog to save the whole deck as a PDF.</p>
      </div>
    </div>
  </div>
</section>`;

  const shape = `<section class="slide slide-plain" id="s2" aria-label="The six questions">
  <div class="slide-inner">
    <p class="deck-kicker">The framework</p>
    <h2>Six questions that expose almost anything</h2>
    <ol class="deck-six">
${checklist.pillars.map((p) => `      <li><strong>${esc(p.name.replace(/^\d+\.\s*/, ''))}</strong><span>${esc(p.principle)}</span></li>`).join('\n')}
    </ol>
    <p class="deck-foot">Three or more hits means stop and verify on a channel they did not give you.</p>
  </div>
</section>`;

  const scamSlides = top20.map((s, i) => `<section class="slide slide-scam band-${s.band.id}" id="s${i + 3}" aria-label="${esc(s.name)}">
  <div class="slide-inner">
    <div class="deck-scam-head">
      <div>
        <p class="deck-kicker">#${s.top20Rank} · ${esc(s.categoryName)}</p>
        <h2>${esc(s.name)}</h2>
        <p class="deck-sum">${esc(s.summary)}</p>
      </div>
      <div class="deck-score">
        <span class="deck-score-num">${s.threat}</span>
        <span class="deck-score-lbl">${esc(s.band.label)} threat</span>
        <span class="deck-score-loss">${rands(s.typicalLoss.low)}–${rands(s.typicalLoss.high)}</span>
      </div>
    </div>
    <div class="deck-cols deck-cols-3">
      <div class="deck-col">
        <h3>How it runs</h3>
        <ol class="deck-list">
${s.howItWorks.slice(0, 4).map((h) => `          <li><strong>${esc(h.step)}.</strong> ${esc(firstSentence(h.detail))}</li>`).join('\n')}
        </ol>
      </div>
      <div class="deck-col deck-col-flags">
        <h3>How you spot it</h3>
        <ul class="deck-list">
${s.redFlags.slice(0, 4).map((f) => `          <li>${esc(f)}</li>`).join('\n')}
        </ul>
      </div>
      <div class="deck-col deck-col-do">
        <h3>What to do</h3>
        <ul class="deck-list">
${s.howToProtect.slice(0, 3).map((p) => `          <li>${esc(p)}</li>`).join('\n')}
        </ul>
        <p class="deck-link">Full breakdown: isitascam.co.za${s.url}</p>
      </div>
    </div>
  </div>
</section>`).join('\n');

  const rulesSlide = `<section class="slide slide-plain slide-rules" id="s${top20.length + 3}" aria-label="Rules with no exceptions">
  <div class="slide-inner">
    <p class="deck-kicker">Take this away</p>
    <h2>Rules with no exceptions</h2>
    <ul class="deck-rules">
${checklist.hardRules.map((r) => `      <li>${esc(r)}</li>`).join('\n')}
    </ul>
  </div>
</section>`;

  const reportSlide = `<section class="slide slide-plain" id="s${top20.length + 4}" aria-label="Where to report">
  <div class="slide-inner">
    <p class="deck-kicker">If it has already happened</p>
    <h2>Report it, in this order</h2>
    <ol class="deck-report">
${resources.immediateSteps.map((s) => `      <li><strong>${esc(s.action)}.</strong> ${esc(s.detail)}</li>`).join('\n')}
    </ol>
    <p class="deck-foot">Full reporting guide, including which body handles which type of fraud: isitascam.co.za/report/</p>
  </div>
</section>`;

  const endSlide = `<section class="slide slide-cover slide-end" id="s${top20.length + 5}" aria-label="End">
  <div class="slide-inner">
    <h2>Look it up before you pay.</h2>
    <p class="deck-sub">${scams.length} scams, scored and explained, free and open to everyone.</p>
    <p class="deck-url">isitascam.co.za</p>
  </div>
</section>`;

  const slides = [cover, howTo, shape, scamSlides, rulesSlide, reportSlide, endSlide].join('\n');
  const total = top20.length + 6;

  const body = `<div class="deck" id="deck">
<div class="deck-chrome no-print">
  <a class="deck-exit" href="/" aria-label="Back to site">←</a>
  <span class="deck-title">South Africa's Top 20 Scams</span>
  <div class="deck-controls">
    <button id="prev" aria-label="Previous slide">‹</button>
    <span class="deck-counter"><span id="cur">1</span> / ${total}</span>
    <button id="next" aria-label="Next slide">›</button>
    <button id="printbtn" class="deck-print" aria-label="Print or save as PDF">Print</button>
    <a class="deck-print deck-dl" href="${PDF_PATH}" download aria-label="Download the deck as a PDF">PDF</a>
  </div>
</div>
<div class="slides" id="slides">
${slides}
</div>
</div>`;

  write('deck/index.html', layout({
    title: "South Africa's Top 20 Scams — a free briefing deck",
    description: "A presentable, printable deck covering the 20 scams most active in South Africa right now: how each one runs, the red flags that expose it, and what to do if it has already happened.",
    canonical: '/deck/',
    bodyClass: 'page-deck',
    body,
    extraHead: '<link rel="stylesheet" href="/assets/deck.css">',
    script: '<script src="/assets/deck.js"></script>',
    jsonld: [breadcrumbs(trail), {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: "South Africa's Top 20 Scams", numberOfItems: top20.length,
      itemListElement: top20.map((s) => ({
        '@type': 'ListItem', position: s.top20Rank, name: s.name, url: site.url + s.url,
      })),
    }],
  }));
}

/* ── 404, robots, sitemap, assets ────────────────────────────────────────── */
function buildExtras() {
  write('404.html', layout({
    title: 'Page not found',
    description: 'That page does not exist. Search the scam library instead.',
    canonical: '/404.html',
    bodyClass: 'page-404',
    body: `<div class="wrap page-head">
  <h1>That page does not exist</h1>
  <p class="lede">The link may be old, or mistyped. Nothing here is behind a login, so if you were sent a link claiming otherwise, be suspicious of whoever sent it.</p>
  <p class="section-foot"><a class="btn btn-primary" href="/scams/">Search the scam library</a> <a class="btn btn-ghost" href="/checklist/">Run the checklist</a></p>
</div>`,
  }));
  sitemapUrls.pop(); // 404 does not belong in the sitemap

  fs.writeFileSync(path.join(OUT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  const urls = [...new Set(sitemapUrls)];
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${site.url}${u === '/' ? '/' : u}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u === '/' ? '1.0' : u.startsWith('/scams/') && u !== '/scams/' ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`);

  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
  for (const f of fs.readdirSync(SRC)) {
    fs.copyFileSync(path.join(SRC, f), path.join(OUT, 'assets', f));
  }

  // Downloadable files (the deck PDF) ship as-is. Regenerate the PDF with
  // `npm run pdf` after changing the deck, otherwise it drifts from the site.
  const downloads = path.join(ROOT, 'assets');
  if (fs.existsSync(downloads)) {
    fs.mkdirSync(path.join(OUT, 'downloads'), { recursive: true });
    for (const f of fs.readdirSync(downloads)) {
      fs.copyFileSync(path.join(downloads, f), path.join(OUT, 'downloads', f));
    }
  }
}

/* ── Run ─────────────────────────────────────────────────────────────────── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

buildHome();
buildLibrary();
buildCategories();
buildScamPages();
buildChecklist();
buildReport();
buildDeck();
buildExtras();

console.log(`Built ${pages.length} pages from ${scams.length} scams into public/`);
console.log(`  ${top20.length} scams ranked in the South African top 20`);
console.log(`  ${sitemapUrls.length} URLs in sitemap.xml`);
