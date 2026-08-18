/* RE/MAX Coastal prototype — behaviour layer */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const rand = () => Math.random().toString(36).slice(2, 9);

  /* ---------- shared chrome ---------------------------------------------- */
  function chrome() {
    // demo banner
    if (CONFIG.DEMO_BANNER && !$('.demo-bar')) {
      const b = document.createElement('div');
      b.className = 'demo-bar';
      b.innerHTML = 'Prototype built by JCE Media for RE/MAX Coastal &middot; ' +
        '<b>demonstration only</b> &middot; property data pulled live from remaxcoastal.co.za';
      document.body.prepend(b);
      const setH = () => document.documentElement.style
        .setProperty('--demo-h', b.getBoundingClientRect().height + 'px');
      setH();
      addEventListener('resize', setH, { passive: true });
    }

    // header solidify
    const hdr = $('.hdr');
    if (hdr) {
      const onScroll = () => hdr.classList.toggle('solid', window.scrollY > 40);
      onScroll();
      addEventListener('scroll', onScroll, { passive: true });
    }

    // mobile nav
    const burger = $('.burger'), mnav = $('.mnav');
    if (burger && mnav) {
      burger.onclick = () => { mnav.classList.add('open'); document.body.style.overflow = 'hidden'; };
      const close = () => { mnav.classList.remove('open'); document.body.style.overflow = ''; };
      $('.mnav .close', mnav).onclick = close;
      $$('.mnav a').forEach(a => a.addEventListener('click', close));
    }

    // whatsapp float
    if (!$('.wa-float')) {
      const href = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_TEXT);
      const w = document.createElement('div');
      w.className = 'wa-float';
      w.innerHTML =
        '<div class="wa-bubble"><span class="x" aria-label="Dismiss">&times;</span>' +
        '<b>Questions about a property?</b>We reply on WhatsApp in under a minute, 7 days a week.</div>' +
        '<a class="wa-btn" href="' + href + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.8 9.8 0 0 1-1.5-5.23c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.02 6.93 2.88a9.74 9.74 0 0 1 2.87 6.93c0 5.41-4.4 9.81-9.8 9.81M20.52 3.45A11.7 11.7 0 0 0 12.05 0C5.6 0 .35 5.25.34 11.7c0 2.06.54 4.08 1.56 5.86L.24 24l6.59-1.73a11.7 11.7 0 0 0 5.21 1.25h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.21-6.07-3.43-8.28"/></svg></a>';
      document.body.appendChild(w);
      const x = $('.wa-bubble .x', w);
      if (x) x.onclick = e => { e.preventDefault(); $('.wa-bubble', w).classList.add('hide'); };
    }

    // reveal on scroll
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    $$('.rv').forEach(el => io.observe(el));

    // hero search: strip empty fields so the results URL stays clean and shareable
    const hs = $('#herosearch');
    if (hs) hs.addEventListener('submit', e => {
      e.preventDefault();
      const u = new URLSearchParams();
      new FormData(hs).forEach((v, k) => { if (v) u.set(k, v); });
      location.href = 'properties.html' + (u.toString() ? '?' + u : '');
    });

    // year
    $$('.yr').forEach(e => e.textContent = new Date().getFullYear());
  }

  /* ---------- formatting -------------------------------------------------- */
  const money = n => 'R' + n.toLocaleString('en-ZA').replace(/,/g, ' ');
  const cap = s => (s || '').replace(/\b\w/g, c => c.toUpperCase());
  const stars = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

  const ICON = {
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5M2 17h20M2 17v3M22 17v3M6 10V7a1 1 0 0 1 1-1h4v4"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3zM6 12V5a2 2 0 0 1 4 0M5 19l-1 2M19 19l1 2"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3h18v18H3zM9 3v18M3 9h18"/></svg>',
    type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>'
  };

  /* ---------- property cards ---------------------------------------------- */
  const specsOf = p => {
    const s = [];
    if (p.beds) s.push(`<span class="p-spec">${ICON.bed}${p.beds} bed</span>`);
    if (p.baths) s.push(`<span class="p-spec">${ICON.bath}${p.baths} bath</span>`);
    if (p.floor) s.push(`<span class="p-spec">${ICON.area}${p.floor} m²</span>`);
    else if (p.erf) s.push(`<span class="p-spec">${ICON.area}${p.erf} m² erf</span>`);
    if (!p.beds && !p.baths) s.push(`<span class="p-spec">${ICON.type}${p.type}</span>`);
    return s.join('');
  };
  const titleOf = p => p.beds
    ? `${p.beds} bedroom ${p.type.toLowerCase()} in ${p.suburb}`
    : `${p.type} in ${p.suburb}`;

  function propCard(p) {
    const url = 'property.html?ref=' + encodeURIComponent(p.ref);
    return `<article class="card rv">
      <a class="p-img" href="${url}">
        <img src="${p.img}" alt="${titleOf(p)}" loading="lazy" decoding="async" width="1440" height="1080">
        <span class="p-price">${money(p.price)}</span>
        <span class="p-tag">For sale</span>
        <span class="p-count">${p.imgs.length} photos</span>
      </a>
      <div class="p-body">
        <div class="p-loc">${p.suburb}, ${p.town}</div>
        <a href="${url}"><h3 class="p-title">${titleOf(p)}</h3></a>
        <div class="p-specs">${specsOf(p)}</div>
        <div class="p-foot">
          <span class="p-ref">${p.ref}</span>
          <a class="btn btn-primary btn-sm" href="${url}">View property</a>
        </div>
      </div>
    </article>`;
  }

  function videoCard(v) {
    // role + tabindex so the card is reachable and operable by keyboard,
    // matching the mouse behaviour on the whole card rather than a sub-element
    return `<article class="v-card rv" data-yt="${v.id}" role="button" tabindex="0"
      aria-label="Play video tour: ${v.t}">
      <div class="v-thumb">
        <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="${v.t}" loading="lazy" decoding="async" width="480" height="360">
        <span class="v-play"><i><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></i></span>
        <span class="v-len">${v.len}</span>
      </div>
      <div class="v-body">
        <h3 class="v-title">${v.t}</h3>
        <div class="v-meta"><span class="pin">${v.area}</span><span>${v.views} views</span><span>${v.age}</span></div>
      </div>
    </article>`;
  }

  /* ---------- rental card --------------------------------------------------- */
  function rentCard(p) {
    const specs = [];
    if (p.beds) specs.push(`<span class="p-spec">${ICON.bed}${p.beds} bed</span>`);
    if (p.baths) specs.push(`<span class="p-spec">${ICON.bath}${p.baths} bath</span>`);
    if (p.floor) specs.push(`<span class="p-spec">${ICON.area}${p.floor} m²</span>`);
    if (!specs.length) specs.push(`<span class="p-spec">${ICON.type}${p.type}</span>`);
    return `<article class="card rv">
      <a class="p-img" href="${p.href}" target="_blank" rel="noopener">
        <img src="${p.img}" alt="${p.type} to rent in ${p.suburb}" loading="lazy" decoding="async" width="1440" height="1080">
        <span class="p-price">${money(p.price)}<small style="font-size:12px;font-weight:600"> pm</small></span>
        <span class="p-tag" style="background:var(--blue)">To let</span>
      </a>
      <div class="p-body">
        <div class="p-loc">${p.suburb}, ${p.town}</div>
        <h3 class="p-title">${p.beds ? p.beds + ' bedroom ' : ''}${p.type.toLowerCase()} to rent</h3>
        <div class="p-specs">${specs.join('')}</div>
        <div class="p-foot">
          <span class="p-ref">${p.ref}</span>
          <button class="btn btn-primary btn-sm js-enq" data-ref="${p.ref}"
            data-label="${p.beds ? p.beds + ' bed ' : ''}${p.type} to rent in ${p.suburb}">Enquire</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- area guide ---------------------------------------------------- */
  function renderArea(root) {
    const name = new URLSearchParams(location.search).get('town');
    const a = AREAS.find(x => x.name.toLowerCase() === (name || '').toLowerCase());
    if (!a) {
      root.innerHTML = `<section class="page-head"><div class="wrap">
          <div class="eyebrow">Areas</div><h1>Where we work</h1>
          <p>Four towns between Mossel Bay and Knysna. Pick one to see what is available.</p>
        </div></section>
        <section class="section"><div class="wrap"><div class="grid g-4">
          ${AREAS.map(x => `<a class="area rv" href="area.html?town=${encodeURIComponent(x.name)}">
            <img src="${x.img}" alt="${x.name}" loading="lazy" decoding="async" width="1440" height="1080">
            <div class="area-in"><h3>${x.name}</h3><p>${x.blurb}</p></div></a>`).join('')}
        </div></div></section>`;
      $$('.rv', root).forEach(e => e.classList.add('in'));
      return;
    }

    document.title = `Property in ${a.name} | RE/MAX Coastal`;
    const dsc = $('meta[name=description]');
    if (dsc) dsc.setAttribute('content', a.blurb);

    const sale = LISTINGS.filter(p => p.town === a.name || p.suburb === a.name);
    const rent = (typeof RENTALS !== 'undefined' ? RENTALS : []).filter(p => p.town === a.name);
    const vids = VIDEOS.filter(v => v.area === a.name).slice(0, 4);
    const off = OFFICES.find(o => o.town === a.name);

    root.innerHTML = `
      <section class="c-hero">
        <div class="bg"><img src="${a.img}" alt="${a.name}"></div>
        <div class="wrap" style="position:relative">
          <a class="backlink" href="area.html">&larr; All areas</a>
          <div class="eyebrow" style="color:#8FB3EE">Area guide</div>
          <h1 style="color:#fff;max-width:14ch">Property in ${a.name}</h1>
          <p class="lede" style="color:#C3D3EE;max-width:56ch">${a.blurb}</p>
          <div style="display:flex;gap:11px;flex-wrap:wrap;margin-top:26px">
            ${sale.length
              ? `<a class="btn btn-primary btn-lg" href="properties.html?town=${encodeURIComponent(a.name)}">
                   ${sale.length} for sale</a>`
              : `<a class="btn btn-primary btn-lg" href="sell.html">Tell us what you are looking for</a>`}
            ${rent.length ? `<a class="btn btn-ghost btn-lg" href="rentals.html"
              style="background:transparent;border-color:rgba(255,255,255,.4);color:#fff">${rent.length} to let</a>` : ''}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="wrap p-cols">
          <div>
            <h2>About ${a.name}</h2>
            <p class="lede">${a.detail}</p>
            ${sale.length ? `<h2 style="margin-top:44px">For sale in ${a.name}</h2>
              <div class="grid g-3" style="margin-top:22px">${sale.map(propCard).join('')}</div>` :
              `<div class="empty" style="margin-top:30px"><h3>Nothing listed here right now</h3>
               <p style="margin-top:8px">Stock in ${a.name} moves quickly. Tell us what you are after and we
               will send it before it reaches a portal.</p>
               <a class="btn btn-primary" style="margin-top:18px" href="sell.html">Set up alerts</a></div>`}
            ${vids.length ? `<h2 style="margin-top:46px">Video tours in ${a.name}</h2>
              <div class="grid g-3" style="margin-top:22px">${vids.map(videoCard).join('')}</div>` : ''}
          </div>
          <aside>
            ${off ? `<div class="factbox">
              <h3>Our ${a.name} office</h3>
              <p style="margin-bottom:12px">${off.addr}</p>
              <div class="o-rate" style="margin-bottom:14px"><span class="o-stars">${stars(off.rating)}</span>
                ${off.rating.toFixed(1)} <span style="color:var(--mute-2);font-weight:500">(${off.reviews} reviews)</span></div>
              <a class="btn btn-blue btn-block btn-sm" href="tel:${off.tel}">${off.phone}</a>
              <a class="btn btn-ghost btn-block btn-sm" style="margin-top:9px" href="${off.map}"
                 target="_blank" rel="noopener">Directions</a>
            </div>` : ''}
            <div class="factbox alt">
              <h3>Thinking of selling in ${a.name}?</h3>
              <p>We will tell you what the last six comparable sales actually transferred for, not what
                they were listed at.</p>
              <a class="btn btn-primary btn-block btn-sm" style="margin-top:14px" href="sell.html">Free valuation</a>
            </div>
          </aside>
        </div>
      </section>`;
    $$('.rv', root).forEach(e => e.classList.add('in'));
  }

  /* ---------- agent profile -------------------------------------------------- */
  function renderAgent(root) {
    const slug = new URLSearchParams(location.search).get('a');
    const t = TEAM.find(x => x.name.toLowerCase().replace(/[^a-z]+/g, '-') === slug);
    if (!t) {
      root.innerHTML = `<section class="page-head"><div class="wrap">
          <div class="eyebrow">The team</div><h1>Who you will deal with</h1>
          <p>Named people in the town you are buying in. No lead pools, no call centres.</p>
        </div></section>
        <section class="section"><div class="wrap"><div class="grid g-4" id="team"></div></div></section>`;
      const g = $('#team', root);
      g.innerHTML = TEAM.map(x => `<a class="t-card rv" href="agent.html?a=${x.name.toLowerCase().replace(/[^a-z]+/g,'-')}">
        <div class="t-img"><img src="${x.img}" alt="${x.name}" loading="lazy"></div>
        <div class="t-name">${x.name}</div><div class="t-role">${x.role}</div>
        <div class="t-office">${x.office}</div></a>`).join('');
      $$('.rv', root).forEach(e => e.classList.add('in'));
      return;
    }

    document.title = `${t.name}, ${t.role} | RE/MAX Coastal`;
    const off = OFFICES.find(o => o.town === t.office);
    const theirs = LISTINGS.filter(p => p.agent && t.name.toLowerCase().includes(p.agent.toLowerCase()));

    root.innerHTML = `
      <section class="page-head">
        <div class="wrap">
          <a class="backlink" href="agent.html">&larr; All of the team</a>
          <div class="agent-hero">
            <div class="agent-photo"><img src="${t.img}" alt="${t.name}"></div>
            <div>
              <div class="eyebrow">${t.role}</div>
              <h1 style="margin-bottom:10px">${t.name}</h1>
              <p>Based at our ${t.office} office, covering ${t.office} and the surrounding suburbs.</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
                <a class="btn btn-wa" href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hi, I would like to speak to ' + t.name)}"
                   target="_blank" rel="noopener">WhatsApp ${t.name.split(' ')[0]}</a>
                ${off ? `<a class="btn btn-ghost" href="tel:${off.tel}"
                  style="background:transparent;border-color:rgba(255,255,255,.4);color:#fff">${off.phone}</a>` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="wrap">
          ${theirs.length ? `<div class="eyebrow">On the market</div>
            <h2 style="margin-bottom:28px">${t.name.split(' ')[0]}'s listings</h2>
            <div class="grid g-3">${theirs.map(propCard).join('')}</div>` :
            `<div class="eyebrow">Get in touch</div>
             <h2 style="margin-bottom:14px">Ask ${t.name.split(' ')[0]} anything</h2>
             <p class="lede">Whether it is a property on this site, what your home is worth, or just what a
               street is really like, send a message and you will get a straight answer.</p>
             <a class="btn btn-primary btn-lg" style="margin-top:24px" href="contact.html">Get in touch</a>`}
        </div>
      </section>`;
    $$('.rv', root).forEach(e => e.classList.add('in'));
  }

  /* ---------- bond calculator ------------------------------------------------- */
  function calculator(root) {
    const el = id => $('#' + id, root);
    const fmt = n => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ');

    const run = () => {
      const price = +el('c-price').value || 0;
      const dep = +el('c-dep').value || 0;
      const rate = parseFloat(el('c-rate').value) || 0;
      const years = +el('c-years').value || 20;
      const principal = Math.max(price - dep, 0);
      const r = rate / 100 / 12, n = years * 12;
      const m = r > 0 ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n;
      const total = m * n, interest = total - principal;

      el('o-month').textContent = principal ? fmt(m) : 'R0';
      el('o-loan').textContent = fmt(principal);
      el('o-total').textContent = fmt(total);
      el('o-interest').textContent = fmt(interest);
      el('o-income').textContent = fmt(m * 3.33);
      $$('.c-out', root).forEach(o => o.classList.add('ready'));
    };

    $$('input,select', root).forEach(i => { i.addEventListener('input', run); i.addEventListener('change', run); });
    run();
  }

  /* ---------- single property ---------------------------------------------- */
  function renderProperty(root) {
    const ref = new URLSearchParams(location.search).get('ref');
    const p = LISTINGS.find(x => x.ref === ref);

    if (!p) {
      root.innerHTML = `<div class="wrap" style="padding:170px 0 90px;text-align:center">
        <h1>We could not find that property</h1>
        <p class="lede" style="margin-inline:auto">It may have sold, or the link may be out of date.
          Everything currently on our books is one click away.</p>
        <a class="btn btn-primary btn-lg" style="margin-top:26px" href="properties.html">See all properties</a>
      </div>`;
      return;
    }

    document.title = `${p.head} | RE/MAX Coastal`;
    const d = $('meta[name=description]');
    if (d) d.setAttribute('content', p.desc.slice(0, 155));

    const facts = [
      ['Property type', p.type], ['Bedrooms', p.beds || null], ['Bathrooms', p.baths || null],
      ['Floor area', p.floor ? p.floor + ' m²' : null], ['Erf size', p.erf ? p.erf + ' m²' : null],
      ['Rates and taxes', p.rates ? money(p.rates) + ' pm' : null], ['Web reference', p.ref]
    ].filter(r => r[1]);

    const related = VIDEOS.filter(v => v.area === p.town).slice(0, 3);
    const nearby = LISTINGS.filter(x => x.ref !== p.ref)
      .sort((a, b) => (a.town === p.town ? -1 : 1) - (b.town === p.town ? -1 : 1)).slice(0, 3);

    root.innerHTML = `
      <div class="p-hero">
        <div class="wrap">
          <a class="backlink" href="properties.html">&larr; All properties</a>
          <div class="p-hero-grid">
            <div>
              <div class="p-loc" style="color:#FF9AA3">${p.suburb}, ${p.town}</div>
              <h1>${p.head}</h1>
              <div class="p-specs" style="border:0;padding:0;margin-top:16px">${specsOf(p)}</div>
            </div>
            <div class="p-pricebox">
              <div class="k">Asking price</div>
              <div class="v">${money(p.price)}</div>
              ${p.agent ? `<div class="ag">Marketed by <b>${p.agent}</b></div>` : ''}
              <a class="btn btn-wa btn-block" style="margin-top:14px"
                 href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hi, I am interested in ' + p.ref + ' (' + p.head + ')')}"
                 target="_blank" rel="noopener">Ask about this on WhatsApp</a>
              <button class="btn btn-ghost btn-block js-enq" style="margin-top:9px"
                 data-ref="${p.ref}" data-label="${p.head}">Request a viewing</button>
            </div>
          </div>
        </div>
      </div>

      <div class="wrap gal">
        <div class="gal-main"><img id="gal-img" src="${p.imgs[0]}" alt="${p.head}" fetchpriority="high" decoding="async" width="1440" height="1080"></div>
        <div class="gal-thumbs">
          ${p.imgs.map((u, i) => `<button class="gth${i === 0 ? ' on' : ''}" data-src="${u}"
             aria-label="Photo ${i + 1}"><img src="${u}" alt="" loading="lazy" decoding="async" width="1440" height="1080"></button>`).join('')}
        </div>
      </div>

      <section class="section">
        <div class="wrap p-cols">
          <div>
            <h2>About this property</h2>
            <p class="lede" style="margin-bottom:18px">${p.desc}</p>
            <p style="font-size:13.5px;color:var(--mute-2)">Description and photography from the RE/MAX Coastal
              listing. Full listing and floor plans on request.</p>

            ${related.length ? `<h2 style="margin-top:46px">Video tours in ${p.town}</h2>
              <p class="lede" style="margin-bottom:20px">Walk a property in this area before you drive down.</p>
              <div class="grid g-3">${related.map(videoCard).join('')}</div>` : ''}
          </div>
          <aside>
            <div class="factbox">
              <h3>The details</h3>
              <dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
              <a class="btn btn-ghost btn-block btn-sm" style="margin-top:16px" href="${p.href}"
                 target="_blank" rel="noopener">View on remaxcoastal.co.za</a>
            </div>
            <div class="factbox alt">
              <h3>Buying from out of town?</h3>
              <p>Send us your list of questions in one message. We will answer all of them, send anything
                you have not seen, and only book a trip when it is worth the drive.</p>
              <a class="btn btn-wa btn-block btn-sm" style="margin-top:14px"
                 href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener">Message us</a>
            </div>
          </aside>
        </div>
      </section>

      <section class="section alt">
        <div class="wrap">
          <div class="eyebrow">Also available</div>
          <h2 style="margin-bottom:30px">Other properties you might like</h2>
          <div class="grid g-3">${nearby.map(propCard).join('')}</div>
        </div>
      </section>`;

    // gallery switching
    const main = $('#gal-img', root);
    $$('.gth', root).forEach(b => b.addEventListener('click', () => {
      main.src = b.dataset.src;
      $$('.gth', root).forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    }));
    $$('.rv', root).forEach(e => e.classList.add('in'));
  }

  /* ---------- video modal -------------------------------------------------- */
  function videoModal() {
    // Enter and Space activate the card the same way a click does
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const c = e.target.closest('[data-yt]');
      if (!c) return;
      e.preventDefault();
      c.click();
    });
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-yt]');
      if (!c) return;
      const id = c.dataset.yt;
      const title = (c.querySelector('.v-title')?.textContent || 'Property video').trim();
      openModal(
        `<div style="width:min(1000px,100%);aspect-ratio:16/9;position:relative">
          <iframe style="width:100%;height:100%;border:0;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6)"
            src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="${title}"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
          <button class="js-x" aria-label="Close video" style="position:absolute;top:-44px;right:0;width:38px;
            height:38px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:22px;
            line-height:1">&times;</button>
        </div>`,
        { label: title,
          style: 'position:fixed;inset:0;z-index:100;background:rgba(6,12,24,.92);display:grid;' +
                 'place-items:center;padding:20px;animation:fade .25s ease' });
    });
  }

  /* ---------- GHL submit --------------------------------------------------- */
  /* Posts to a GoHighLevel Inbound Webhook. No API token ever reaches the
     browser, so this is safe to host publicly. If CONFIG.GHL_WEBHOOK is empty
     the form still runs end to end in demo mode.                              */
  async function sendLead(payload) {
    payload.source = 'RE/MAX Coastal prototype';
    payload.submitted_at = new Date().toISOString();
    payload.demo = true;
    payload.lead_id = 'RMC-' + rand().toUpperCase();

    if (!CONFIG.GHL_WEBHOOK) {
      console.info('[demo mode] lead captured, no webhook configured:', payload);
      return { ok: true, demo: true, id: payload.lead_id };
    }
    try {
      const r = await fetch(CONFIG.GHL_WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      return { ok: r.ok, demo: false, id: payload.lead_id };
    } catch (err) {
      console.warn('webhook failed, falling back to demo mode', err);
      return { ok: true, demo: true, id: payload.lead_id };
    }
  }

  /* ---------- accessible modal shell -----------------------------------------
     Handles dialog semantics, focus move-in, focus trap, Escape and focus
     restore so both the enquiry and video modals behave for keyboard users.    */
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';

  function openModal(inner, opts) {
    opts = opts || {};
    const opener = document.activeElement;
    const m = document.createElement('div');
    m.className = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    if (opts.label) m.setAttribute('aria-label', opts.label);
    m.style.cssText = opts.style || ('position:fixed;inset:0;z-index:100;background:rgba(6,12,24,.7);' +
      'backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px;overflow:auto;' +
      'animation:fade .25s ease');
    m.innerHTML = inner;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';

    const close = () => {
      m.remove();
      document.body.style.overflow = '';
      removeEventListener('keydown', onKey, true);
      if (opener && opener.focus) opener.focus();
    };
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = [...m.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    addEventListener('keydown', onKey, true);
    m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('.js-x')) close();
    });
    // move focus in
    const target = m.querySelector('input,button,[href]');
    if (target) target.focus();
    return { el: m, close };
  }

  /* ---------- shared field validation ---------------------------------------
     Required fields must be non-empty. Optional fields are still format-checked
     when the user has typed something, so a typo'd email is caught rather than
     silently delivering an unreachable lead.                                    */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const DIGITS = /\d/g;

  function fieldError(f) {
    const v = (f.value || '').trim();
    if (f.hasAttribute('required') && v === '') return 'Required';
    if (v === '') return null;                      // optional and empty is fine
    if (f.type === 'email' && !EMAIL.test(v)) return 'Check that email address';
    if (f.type === 'tel') {
      const n = (v.match(DIGITS) || []).length;
      if (n < 9 || n > 15) return 'Check that number';
    }
    return null;
  }

  function validateScope(scope) {
    let bad = false;
    $$('input,select,textarea', scope).forEach(f => {
      if (f.type === 'hidden' || f.type === 'submit') return;
      const wrap = f.closest('.field');
      if (!wrap) return;
      const err = fieldError(f);
      wrap.classList.toggle('err', !!err);
      if (err) {
        let msg = $('.msg', wrap);
        if (!msg) { msg = document.createElement('span'); msg.className = 'msg'; wrap.appendChild(msg); }
        msg.textContent = err;
        bad = true;
      }
    });
    return !bad;
  }

  /* ---------- qualification form ------------------------------------------- */
  function qualForm(root) {
    if (!root) return;
    const steps = $$('.step', root);
    const bars = $$('.sdot i', root);
    const data = {};
    let i = 0;

    const paint = () => {
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      $$('.sdot', root).forEach((d, k) => d.classList.toggle('fill', k <= i));
      bars.forEach((b, k) => b.style.width = k <= i ? '100%' : '0');
    };

    // chips
    $$('.chip', root).forEach(c => c.addEventListener('click', () => {
      const grp = c.closest('.chips');
      $$('.chip', grp).forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      data[grp.dataset.key] = c.dataset.val;
      const auto = grp.dataset.auto;
      if (auto !== 'no' && i < steps.length - 1) setTimeout(() => { i++; paint(); }, 260);
    }));

    $$('.js-next', root).forEach(b => b.addEventListener('click', () => {
      if (!validateScope(steps[i])) return;
      if (i < steps.length - 1) { i++; paint(); }
    }));
    $$('.js-back', root).forEach(b => b.addEventListener('click', () => { if (i > 0) { i--; paint(); } }));

    $$('.field input,.field select,.field textarea', root).forEach(f => {
      f.addEventListener('input', () => f.closest('.field').classList.remove('err'));
    });

    const form = $('form', root);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateScope(steps[i])) return;

      new FormData(form).forEach((v, k) => { if (v) data[k] = v; });
      const btn = $('button[type=submit]', form);
      const was = btn.textContent;
      btn.textContent = 'Sending…'; btn.disabled = true;

      const res = await sendLead(data);

      $('.form-body', root).style.display = 'none';
      const done = $('.done', root);
      done.classList.add('on');
      const name = (data.first_name || 'there').split(' ')[0];
      const ref = $('.js-refno', done);
      if (ref) ref.textContent = res.id;
      const who = $('.js-name', done);
      if (who) who.textContent = name;
      // animate the reply bubbles
      $$('.done .bub', root).forEach((b, k) => b.style.animationDelay = (0.35 + k * 0.75) + 's');
      done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      btn.textContent = was; btn.disabled = false;
    });

    paint();
  }

  /* ---------- quick enquire modal ------------------------------------------ */
  function enquireModal() {
    document.addEventListener('click', e => {
      const b = e.target.closest('.js-enq');
      if (!b) return;
      const label = b.dataset.label || 'a property';
      const ref = b.dataset.ref || '';
      const inner = `<div class="form-card" style="width:min(520px,100%);position:relative">
        <button aria-label="Close" class="js-x" style="position:absolute;top:16px;right:16px;width:34px;height:34px;
          border-radius:50%;background:var(--bg-3);font-size:20px;line-height:1;color:var(--mute)">&times;</button>
        <div class="eyebrow">Enquiry</div>
        <h3 style="font-size:22px">${label}</h3>
        <p style="font-size:14px;color:var(--mute);margin-top:6px">Ref ${ref}. Send this and you will have a
          reply on WhatsApp in under a minute, day or night.</p>
        <form style="margin-top:20px" novalidate>
          <div class="fgrid">
            <div class="field"><label>First name <span class="req">*</span></label>
              <input name="first_name" required placeholder="Jana"><span class="msg">Required</span></div>
            <div class="field"><label>Last name</label><input name="last_name" placeholder="Botha"></div>
            <div class="field full"><label>WhatsApp number <span class="req">*</span></label>
              <input name="phone" required type="tel" placeholder="082 123 4567"><span class="msg">Required</span></div>
            <div class="field full"><label>Email</label><input name="email" type="email" placeholder="you@email.com"></div>
            <div class="field full"><label>Do you have a property to sell first?</label>
              <select name="has_property_to_sell">
                <option value="">Select…</option><option>No</option>
                <option>Yes, in the Garden Route</option><option>Yes, elsewhere in South Africa</option>
              </select>
              <span class="hint">If yes, we will include a free valuation.</span></div>
          </div>
          <button class="btn btn-primary btn-block btn-lg" style="margin-top:20px" type="submit">Send enquiry</button>
          <p style="font-size:12px;color:var(--mute-2);text-align:center;margin-top:12px">
            Prototype form. Submissions are for demonstration only.</p>
        </form>
        <div class="done">
          <div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>
          <h3>Sent. Watch your WhatsApp.</h3>
          <p>Reference <b class="js-refno"></b>. In the live system the reply below lands in under 60 seconds.</p>
          <div class="chat" style="max-width:330px">
            <div class="chat-top"><div class="chat-av" style="background:#003DA5">
              <span style="color:#fff;font-weight:800;font-size:11px">R/M</span></div>
              <div class="chat-who">RE/MAX Coastal<small>online</small></div></div>
            <div class="bub them" style="animation-delay:.3s">Hi, I'm interested in ${ref}<time>now</time></div>
            <div class="bub us" style="animation-delay:1s">Hi! Thanks for enquiring. Quick question so I send the
              right agent: are you looking to buy, or also to sell?<time>now</time></div>
          </div>
        </div>
      </div>`;
      const { el: m } = openModal(inner, { label: 'Enquire about ' + label });

      const f = $('form', m);
      f.addEventListener('submit', async ev => {
        ev.preventDefault();
        if (!validateScope(f)) return;
        const d = { property_ref: ref, property: label, enquiry_type: 'Property enquiry' };
        new FormData(f).forEach((v, k) => { if (v) d[k] = v; });
        const btn = $('button[type=submit]', f);
        btn.textContent = 'Sending…'; btn.disabled = true;
        const res = await sendLead(d);
        f.style.display = 'none';
        $('.eyebrow', m).style.display = 'none';
        $('.done', m).classList.add('on');
        $('.js-refno', m).textContent = res.id;
      });
    });
  }

  /* ---------- page renderers ------------------------------------------------ */
  function render() {
    const feat = $('#featured');
    if (feat) feat.innerHTML = LISTINGS.slice(0, 6).map(propCard).join('');

    const all = $('#allprops');
    if (all) {
      const towns = [...new Set(LISTINGS.map(p => p.town))].sort();
      const types = [...new Set(LISTINGS.map(p => p.type))].sort();
      $('#f-town').innerHTML = '<option value="">All areas</option>' + towns.map(t => `<option>${t}</option>`).join('');
      $('#f-type').innerHTML = '<option value="">All types</option>' + types.map(t => `<option>${t}</option>`).join('');

      // seed the filters from the querystring so the hero search actually lands here
      const q = new URLSearchParams(location.search);
      const seed = (id, key) => { const v = q.get(key); if (!v) return;
        const el = $(id); if ([...el.options].some(o => o.value === v)) el.value = v; };
      seed('#f-town', 'town'); seed('#f-type', 'type'); seed('#f-price', 'max');

      const draw = (push) => {
        const t = $('#f-town').value, ty = $('#f-type').value, mx = +$('#f-price').value || Infinity;
        const out = LISTINGS.filter(p => (!t || p.town === t) && (!ty || p.type === ty) && p.price <= mx);
        all.innerHTML = out.length ? out.map(propCard).join('')
          : `<div class="empty" style="grid-column:1/-1">
               <h3>No properties match that search</h3>
               <p style="margin-top:8px;max-width:46ch;margin-inline:auto">A lot of what we sell never reaches a
                 portal. Tell us what you are after and we will send what is coming before it is listed.</p>
               <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px">
                 <a class="btn btn-primary" href="sell.html">Set up alerts</a>
                 <button class="btn btn-ghost js-clear">Clear filters</button>
               </div></div>`;
        $('#f-count').textContent = out.length + (out.length === 1 ? ' property' : ' properties');
        const chips = [t, ty, mx !== Infinity ? 'Up to ' + money(mx) : ''].filter(Boolean);
        const sum = $('#f-summary');
        if (sum) sum.innerHTML = chips.length
          ? chips.map(c => `<span class="fchip">${c}</span>`).join('') +
            `<button class="fclear js-clear">Clear all</button>`
          : '';
        $$('.rv', all).forEach(e => e.classList.add('in'));
        if (push) {
          const u = new URLSearchParams();
          if (t) u.set('town', t); if (ty) u.set('type', ty);
          if (mx !== Infinity) u.set('max', String(mx));
          history.replaceState(null, '', u.toString() ? '?' + u : location.pathname);
        }
      };
      $$('#f-town,#f-type,#f-price').forEach(s => s.addEventListener('change', () => draw(true)));
      document.addEventListener('click', e => {
        if (!e.target.closest('.js-clear')) return;
        $('#f-town').value = ''; $('#f-type').value = ''; $('#f-price').value = ''; draw(true);
      });
      draw(false);
    }

    /* ---- rentals ---- */
    const rg = $('#allrentals');
    if (rg && typeof RENTALS !== 'undefined') {
      const towns = [...new Set(RENTALS.map(p => p.town))].sort();
      const types = [...new Set(RENTALS.map(p => p.type))].sort();
      $('#r-town').innerHTML = '<option value="">All areas</option>' + towns.map(t => `<option>${t}</option>`).join('');
      $('#r-type').innerHTML = '<option value="">All types</option>' + types.map(t => `<option>${t}</option>`).join('');
      const draw = () => {
        const t = $('#r-town').value, ty = $('#r-type').value, mx = +$('#r-price').value || Infinity;
        const out = RENTALS.filter(p => (!t || p.town === t) && (!ty || p.type === ty) && p.price <= mx);
        rg.innerHTML = out.length ? out.map(rentCard).join('')
          : `<div class="empty" style="grid-column:1/-1"><h3>Nothing to let matches that</h3>
             <p style="margin-top:8px">Our rental stock turns over quickly. Message us and we will let you
             know the moment something fits.</p>
             <a class="btn btn-primary" style="margin-top:18px" href="contact.html">Register your requirements</a></div>`;
        $('#r-count').textContent = out.length + (out.length === 1 ? ' property' : ' properties');
        $$('.rv', rg).forEach(e => e.classList.add('in'));
      };
      $$('#r-town,#r-type,#r-price').forEach(s => s.addEventListener('change', draw));
      draw();
    }

    /* ---- single property / area / agent / calculator ---- */
    const pp = $('#propertypage'); if (pp) renderProperty(pp);
    const ap = $('#areapage');     if (ap) renderArea(ap);
    const gp = $('#agentpage');    if (gp) renderAgent(gp);
    const cp = $('#calc');         if (cp) calculator(cp);

    const vg = $('#videos');
    if (vg) {
      const n = +vg.dataset.limit || VIDEOS.length;
      vg.innerHTML = VIDEOS.slice(0, n).map(videoCard).join('');
    }

    const vfull = $('#allvideos');
    if (vfull) {
      const draw = () => {
        const a = $('#v-area').value;
        const out = VIDEOS.filter(v => !a || v.area === a);
        vfull.innerHTML = out.map(videoCard).join('');
        $('#v-count').textContent = out.length + ' of ' + VIDEOS.length + ' videos';
        $$('.rv', vfull).forEach(e => e.classList.add('in'));
      };
      const areas = [...new Set(VIDEOS.map(v => v.area))].sort();
      $('#v-area').innerHTML = '<option value="">All areas</option>' + areas.map(a => `<option>${a}</option>`).join('');
      $('#v-area').addEventListener('change', draw);
      draw();
    }

    const tg = $('#team');
    if (tg) tg.innerHTML = TEAM.map(t =>
      `<a class="t-card rv" href="agent.html?a=${t.name.toLowerCase().replace(/[^a-z]+/g, '-')}">
        <div class="t-img"><img src="${t.img}" alt="${t.name}" loading="lazy" decoding="async" width="400" height="400"></div>
        <div class="t-name">${t.name}</div><div class="t-role">${t.role}</div>
        <div class="t-office">${t.office}</div></a>`).join('');

    /* Offices. ?office=Knysna focuses one branch: it is pulled to the top,
       highlighted, and the page intro names it. Reached from the Contact
       dropdown in the header. */
    const og = $('#offices-grid');
    if (og) {
      const wanted = (new URLSearchParams(location.search).get('office') || '').trim().toLowerCase();
      const match = OFFICES.find(o => o.town.toLowerCase() === wanted);
      const list = match ? [match, ...OFFICES.filter(o => o !== match)] : OFFICES;

      og.innerHTML = list.map(o => {
        const on = match && o === match;
        return `<article class="o-card rv${on ? ' is-focus' : ''}" id="office-${o.town.toLowerCase().replace(/[^a-z]+/g,'-')}">
        ${on ? '<span class="o-flag">The office you asked for</span>' : ''}
        <div class="o-town">${o.town}</div>
        <div class="o-rate"><span class="o-stars">${stars(o.rating)}</span> ${o.rating.toFixed(1)}
          <span style="color:var(--mute-2);font-weight:500">(${o.reviews} Google reviews)</span></div>
        <p class="o-addr">${o.addr}</p>
        <div class="o-acts">
          <a class="btn ${on ? 'btn-blue' : 'btn-ghost'} btn-sm" href="tel:${o.tel}">${o.phone}</a>
          <a class="btn btn-ghost btn-sm" href="${o.map}" target="_blank" rel="noopener">Directions</a>
          <a class="btn btn-wa btn-sm" target="_blank" rel="noopener"
             href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hi, I would like to speak to the ' + o.town + ' office.')}">WhatsApp</a>
        </div></article>`; }).join('');

      if (match) {
        const h = $('#c-head'); if (h) h.textContent = 'Talk to our ' + match.town + ' office';
        const p = $('#c-sub');
        if (p) p.textContent = match.addr + '. Message us on WhatsApp for the fastest answer, phone the '
          + 'office directly, or send the form and we will come back to you.';
        const t = $('#c-tel'); if (t) { t.href = 'tel:' + match.tel; t.textContent = match.phone; }
        const f = $('#c-office'); if (f) f.value = match.town;
        // header number should match the branch you are looking at
        const ht = $('.hdr .tel');
        if (ht) { ht.href = 'tel:' + match.tel; ht.textContent = match.phone; }
      }
    }

    const ag = $('#areas');
    if (ag) ag.innerHTML = AREAS.map(a => `<a class="area rv" href="properties.html">
      <img src="${a.img}" alt="${a.name}" loading="lazy" decoding="async" width="1440" height="1080">
      <div class="area-in"><h3>${a.name}</h3><p>${a.blurb}</p></div></a>`).join('');
  }

  /* ---------- go ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    chrome();
    render();
    videoModal();
    enquireModal();
    qualForm($('#qualform'));
    // re-observe cards injected after first paint
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .1, rootMargin: '0px 0px -30px' });
    $$('.rv:not(.in)').forEach(el => io.observe(el));
  });
})();
