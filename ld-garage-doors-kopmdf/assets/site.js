(() => {
  const C = window.LD_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = new URLSearchParams(location.search);
  const live = (id) => id && !/X{6}/.test(id);

  // ---- tags: only load gtag once real IDs are in config.js ----
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  if (live(C.googleAdsId) || live(C.ga4Id)) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (live(C.googleAdsId) ? C.googleAdsId : C.ga4Id);
    document.head.appendChild(s);
    gtag('js', new Date());
    if (live(C.googleAdsId)) gtag('config', C.googleAdsId);
    if (live(C.ga4Id)) gtag('config', C.ga4Id);
  }
  const conv = (label, extra = {}) => { if (live(label)) gtag('event', 'conversion', { send_to: label, ...extra }); };

  // ---- PPC area insertion: /garage-door-repairs/?area=randburg swaps "Johannesburg" in the H1 + prefills the form ----
  const AREA_NAMES = {};
  $$('.js-area-select option').forEach((o) => { if (o.value && o.value !== 'Other') AREA_NAMES[o.value.toLowerCase().replace(/\s+/g, '-')] = o.value; });
  const areaKey = (qs.get('area') || qs.get('loc') || '').toLowerCase().trim();
  const areaName = AREA_NAMES[areaKey];
  if (areaName) {
    $$('.js-area').forEach((e) => (e.textContent = areaName));
    document.title = document.title.replace('Johannesburg', areaName);
    $$('.js-area-select').forEach((s) => (s.value = areaName));
  }

  // ---- attribution: keep gclid for 90 days so a return visit still attributes ----
  try {
    const g = qs.get('gclid') || qs.get('gbraid') || qs.get('wbraid');
    if (g) localStorage.setItem('ld_gclid', JSON.stringify({ g, t: Date.now() }));
    const saved = JSON.parse(localStorage.getItem('ld_gclid') || 'null');
    const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].map((k) => qs.get(k) ? `${k}=${qs.get(k)}` : '').filter(Boolean).join('&');
    if (utm) sessionStorage.setItem('ld_utm', utm);
    if (!sessionStorage.getItem('ld_landing')) sessionStorage.setItem('ld_landing', location.pathname + location.search);
    $$('.js-gclid').forEach((i) => (i.value = saved && Date.now() - saved.t < 90 * 864e5 ? saved.g : ''));
    $$('.js-utm').forEach((i) => (i.value = sessionStorage.getItem('ld_utm') || ''));
    $$('.js-landing').forEach((i) => (i.value = sessionStorage.getItem('ld_landing') || location.pathname));
  } catch (e) { /* storage blocked: forms still work */ }

  // ---- clicks ----
  const svcOnPage = () => ($('.js-svc') || {}).value || '';
  $$('.js-wa').forEach((a) => {
    const area = areaName ? `I am in ${areaName}. ` : '';
    a.href = 'https://wa.me/' + a.href.split('wa.me/')[1].split('?')[0] + '?text=' + encodeURIComponent((C.whatsappText || '') + area);
    a.addEventListener('click', () => { conv(C.convWhatsApp); gtag('event', 'whatsapp_click', { cta: a.dataset.cta, service: svcOnPage() }); });
  });
  $$('.js-call').forEach((a) => a.addEventListener('click', () => { conv(C.convCall); gtag('event', 'call_click', { cta: a.dataset.cta, service: svcOnPage() }); }));

  // mobile bar "Free quote" → nearest form, focus first field
  $$('.js-to-quote').forEach((a) => a.addEventListener('click', (e) => {
    const f = $('#form-hero') || $('#quote form') || $('form.js-lead');
    if (!f) return;
    e.preventDefault();
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => f.querySelector('input[name=name]').focus({ preventScroll: true }), 450);
  }));

  // ---- nav ----
  const tog = $('.nav-toggle');
  if (tog) tog.addEventListener('click', () => {
    const open = tog.getAttribute('aria-expanded') === 'true';
    tog.setAttribute('aria-expanded', String(!open));
    document.body.classList.toggle('nav-open', !open);
  });

  // ---- forms ----
  const phoneOk = (v) => /^(\+?27|0)[6-8]\d{8}$/.test(v.replace(/[\s()-]/g, '')) || /^(\+?27|0)[1-5]\d{8}$/.test(v.replace(/[\s()-]/g, ''));
  $$('form.js-lead').forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = form.querySelector('.form-err');
    const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
    const bad = !name ? 'Please add your name.' : !phoneOk(phone) ? 'Please add a valid South African number, e.g. 082 123 4567.' : '';
    form.querySelectorAll('.f input').forEach((i) => i.classList.remove('invalid'));
    if (bad) {
      err.textContent = bad; err.hidden = false;
      (name ? form.elements.phone : form.elements.name).classList.add('invalid');
      (name ? form.elements.phone : form.elements.name).focus();
      return;
    }
    err.hidden = true;
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending...';
    const fd = new FormData(form);
    const service = fd.get('service') || 'other';
    const B = window.LD_BASE || '';
    let sent = false;
    if (window.LD_PREVIEW) { location.href = B + '/thank-you/?s=' + encodeURIComponent(service) + '&demo=1'; return; }
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() });
      sent = r.ok;
    } catch (x) { /* fall through to webhook */ }
    if (C.webhookUrl) {
      try {
        await fetch(C.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fd)), keepalive: true });
        sent = true;
      } catch (x) { /* ignore */ }
    }
    if (!sent) {
      btn.disabled = false; btn.textContent = 'Get my free quote';
      err.innerHTML = 'Sorry, that did not send. Please call <a href="tel:+27616631330">061 663 1330</a> or WhatsApp us.';
      err.hidden = false;
      return;
    }
    const go = () => (location.href = B + '/thank-you/?s=' + encodeURIComponent(service));
    gtag('event', 'generate_lead', { service, value: (C.leadValues || {})[service] || 300, currency: 'ZAR' });
    if (live(C.convLead)) {
      gtag('event', 'conversion', { send_to: C.convLead, value: (C.leadValues || {})[service] || 300, currency: 'ZAR', event_callback: go });
      setTimeout(go, 1200);
    } else go();
  }));

  // pause offscreen videos (saves battery + data on mobile)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { const v = en.target; if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.15 });
    $$('video[autoplay]').forEach((v) => io.observe(v));
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) $$('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
})();
