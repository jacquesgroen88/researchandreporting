// Clarky's Group site behaviour: menu, reveal, gallery lightbox, booking enquiry.
(function () {
  // Mobile menu: toggle, close on link tap and on Escape.
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  function closeNav() { if (!nav) return; nav.classList.remove('open'); btn && btn.setAttribute('aria-expanded', 'false'); }
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
  }

  // Reveal on scroll. Falls back to showing everything if IntersectionObserver never fires.
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { els.forEach(function (e) { e.classList.add('in'); }); }
  els.forEach(function (e) { if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); });
  document.documentElement.classList.add('js');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(showAll, 2500);
  } else showAll();

  // Lightbox for galleries: a modal dialog that traps focus and returns it on close.
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = '<button class="x" aria-label="Close">&times;</button><button class="prev" aria-label="Previous photo">&#8249;</button><img alt=""><button class="next" aria-label="Next photo">&#8250;</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), set = [], at = 0, opener = null;
  function show(i) { at = (i + set.length) % set.length; lbImg.src = set[at].full; lbImg.alt = set[at].alt; }
  function openLb(b, items, i) { opener = b; set = items; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; if (opener) opener.focus(); }
  document.querySelectorAll('.gallery, .pgrid').forEach(function (g) {
    var btns = [].slice.call(g.querySelectorAll('button'));
    var items = btns.map(function (b) { var im = b.querySelector('img'); return { full: b.dataset.full || im.src, alt: im.alt }; });
    btns.forEach(function (b, i) { b.addEventListener('click', function () { openLb(b, items, i); }); });
  });
  lb.querySelector('.x').onclick = closeLb;
  lb.querySelector('.prev').onclick = function () { show(at - 1); };
  lb.querySelector('.next').onclick = function () { show(at + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) {
      if (e.key === 'Escape' && nav && nav.classList.contains('open')) { closeNav(); btn.focus(); }
      return;
    }
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button'), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  // Booking enquiry.
  // When the ReviewTap system endpoint is set on the form (data-booking-endpoint), the enquiry posts there.
  // Until then it opens WhatsApp with the details filled in, so no enquiry is lost.
  var WA = { bucketlist: '27785719280', lakeside: '27615066214', pride: '27729228530' };
  var MAIL = { bucketlist: 'info@clarkysbucketlist.co.za', lakeside: 'clarkyslakesiderestaurant@gmail.com', pride: '' };
  var LABEL = { bucketlist: "Clarky's Bucketlist", lakeside: 'Clarkys Lakeside Restaurant', pride: "Clarky's Pride Lodge" };
  var MAXG = { bucketlist: 6, lakeside: 30, pride: 14 };
  var PHONE = { bucketlist: '078 571 9280', lakeside: '061 506 6214', pride: '072 922 8530' };
  var TEL = { bucketlist: '+27785719280', lakeside: '+27615066214', pride: '+27729228530' };
  // Per-cottage caps. Woodland Whisper sleeps 2; the others are held at 6 until Val confirms layouts.
  function cap(d) { if (d.property === 'bucketlist' && /^Woodland/.test(d.cottage || '')) return 2; return MAXG[d.property]; }

  // Local date (not UTC), so late-night SAST visitors are not offered yesterday.
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function nice(iso) { if (!iso) return ''; var p = iso.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }

  function message(d) {
    var lines = ["Hi Clarky's, I would like to enquire.", 'Place: ' + (LABEL[d.property] || d.property)];
    if (d.cottage && d.cottage !== 'No preference') lines.push('Cottage: ' + d.cottage);
    if (d.arrive) lines.push((d.property === 'lakeside' ? 'Date: ' : 'Arrive: ') + nice(d.arrive));
    if (d.depart) lines.push('Depart: ' + nice(d.depart));
    if (d.time) lines.push('Sitting: ' + d.time);
    if (d.guests) lines.push('Adults: ' + d.guests);
    if (+d.kids) lines.push('Children: ' + d.kids);
    if (d.dog) lines.push('Bringing a dog: yes');
    if (d.dinner) lines.push('Please also book a dinner table at the Lakeside Restaurant');
    if (d.name) lines.push('Name: ' + d.name);
    if (d.phone) lines.push('Phone: ' + d.phone);
    if (d.message) lines.push(d.message);
    return lines.join('\n');
  }

  document.querySelectorAll('form.booking').forEach(function (f) {
    var arrive = function () { return f.querySelector('input[name=arrive]:not([disabled])'); };
    var depart = f.querySelector('input[name=depart]');
    var guests = f.querySelector('input[name=guests]');
    var kids = f.querySelector('input[name=kids]');
    var phone = f.querySelector('input[name=phone]');
    f.querySelectorAll('input[type=date]').forEach(function (d) {
      d.min = today();
      d.addEventListener('change', function () {
        if (d.name === 'arrive' && depart && d.value) {
          var n = new Date(d.value); n.setDate(n.getDate() + 1);
          depart.min = n.toISOString().slice(0, 10);
          if (depart.value && depart.value <= d.value) depart.value = '';
        }
      });
    });

    function check() {
      var a = arrive(), ok = true;
      [a, depart, guests, phone].forEach(function (el) { if (el) el.setCustomValidity(''); });
      if (a && a.value && a.value < today()) { a.setCustomValidity('Please choose today or a later date.'); }
      if (a && depart && !depart.disabled && depart.value && a.value && depart.value <= a.value) { depart.setCustomValidity('Departure must be after arrival.'); }
      var prop = (f.querySelector('[name=property]') || {}).value;
      var cot = (f.querySelector('select[name=cottage]:not([disabled])') || {}).value;
      var max = cap({ property: prop, cottage: cot });
      var total = (+(guests && guests.value) || 0) + (+(kids && kids.value) || 0);
      if (guests && max && total > max) guests.setCustomValidity(max === 2 ? 'Woodland Whisper sleeps 2. Pick another cottage, or call us.' : 'For more than ' + max + ' guests, please call us.');
      if (phone && phone.value && (phone.value.replace(/\D/g, '').length < 9)) phone.setCustomValidity('Please enter a phone number we can reach you on.');
      ok = f.reportValidity();
      return ok;
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check()) return;
      var data = Object.fromEntries(new FormData(f).entries());
      var endpoint = f.dataset.bookingEndpoint;
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; done(f, data, false); })
          .catch(function () { openWA(data); done(f, data, true); });
        return;
      }
      openWA(data);
      done(f, data, true);
    });
  });

  function openWA(d) {
    window.open('https://wa.me/' + (WA[d.property] || WA.bucketlist) + '?text=' + encodeURIComponent(message(d)), '_blank', 'noopener');
  }
  // Confirmation in place of the form, with an email fallback for desktop visitors without WhatsApp.
  // After sending, the confirmation is scrolled into view and focused, so phone visitors see it when they come back from WhatsApp.
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function done(f, d, viaWA) {
    var mail = MAIL[d.property];
    var alt = mail
      ? ' <a href="mailto:' + mail + '?subject=' + encodeURIComponent('Enquiry: ' + (LABEL[d.property] || '')) + '&body=' + encodeURIComponent(message(d)) + '">Email it to us instead</a>, or call <a href="tel:' + TEL[d.property] + '">' + PHONE[d.property] + '</a>.'
      : ' Call or WhatsApp us on <a href="tel:' + TEL[d.property] + '">' + PHONE[d.property] + '</a>.';
    f.innerHTML = '<div class="done" role="status"><h3 tabindex="-1">' + (viaWA ? 'Your enquiry is ready in WhatsApp.' : 'Thank you, we have your enquiry.') + '</h3><p>' +
      (viaWA ? 'Press send in WhatsApp and we will reply personally. WhatsApp did not open?' + alt : 'We will be in touch shortly.') + '</p>' +
      '<p class="sent">' + esc(message(d)) + '</p></div>';
    var h = f.querySelector('.done h3');
    h.scrollIntoView({ block: 'center' });
    h.focus({ preventScroll: true });
  }

  // Property select drives which fields (and which contact block) show on the group form.
  document.querySelectorAll('form.booking select[name=property]').forEach(function (s) {
    var scope = s.closest('section') || document;
    function sync() {
      var v = s.value;
      scope.querySelectorAll('[data-for]').forEach(function (el) {
        var on = el.dataset.for.split(' ').indexOf(v) > -1;
        el.style.display = on ? '' : 'none';
        el.querySelectorAll('input,select').forEach(function (i) { i.disabled = !on; });
      });
      var g = s.form.querySelector('input[name=guests]'); if (g) g.max = MAXG[v] || 30;
    }
    s.addEventListener('change', sync); sync();
  });

  // "Enquire about <cottage>" buttons preselect that cottage in the form
  document.querySelectorAll('[data-cottage]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = document.querySelector('form.booking select[name=cottage]');
      if (!sel) return;
      var hit = [].filter.call(sel.options, function (o) { return o.text.indexOf(a.dataset.cottage) === 0; })[0];
      if (hit) sel.value = hit.value;
    });
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
