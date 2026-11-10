// Clarky's Group site behaviour: menu, reveal, gallery lightbox, booking enquiry.
(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  // Reveal on scroll. Falls back to showing everything if IntersectionObserver never fires.
  var els = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { els.forEach(function (e) { e.classList.add('in'); }); }
  // Anything already on screen at load shows straight away, never faded.
  els.forEach(function (e) { if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); });
  document.documentElement.classList.add('js');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(showAll, 2500);
  } else showAll();

  // Lightbox for galleries
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.innerHTML = '<button class="x" aria-label="Close">&times;</button><button class="prev" aria-label="Previous">&#8249;</button><img alt=""><button class="next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), set = [], at = 0;
  function show(i) { at = (i + set.length) % set.length; lbImg.src = set[at].full; lbImg.alt = set[at].alt; }
  document.querySelectorAll('.gallery').forEach(function (g) {
    var items = [].slice.call(g.querySelectorAll('button')).map(function (b) {
      var im = b.querySelector('img'); return { full: b.dataset.full || im.src, alt: im.alt };
    });
    g.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () { set = items; show(i); lb.classList.add('open'); });
    });
  });
  lb.querySelector('.x').onclick = function () { lb.classList.remove('open'); };
  lb.querySelector('.prev').onclick = function () { show(at - 1); };
  lb.querySelector('.next').onclick = function () { show(at + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') lb.classList.remove('open');
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });

  // Booking enquiry.
  // When the ReviewTap system endpoint is set on the form (data-booking-endpoint), the enquiry posts there.
  // Until then it opens WhatsApp with the details filled in, so no enquiry is lost.
  var WA = { bucketlist: '27785719280', lakeside: '27615066214', pride: '27785719280' };
  document.querySelectorAll('form.booking').forEach(function (f) {
    var min = new Date().toISOString().slice(0, 10);
    f.querySelectorAll('input[type=date]').forEach(function (d) { d.min = min; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(f).entries());
      var endpoint = f.dataset.bookingEndpoint;
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function () { f.innerHTML = '<p class="lead" style="grid-column:1/-1">Thank you. We have your enquiry and will be in touch shortly.</p>'; })
          .catch(function () { openWA(data); });
        return;
      }
      openWA(data);
    });
  });
  function openWA(d) {
    var labels = { bucketlist: "Clarky's Bucketlist", lakeside: 'Clarkys Lakeside Restaurant', pride: "Clarky's Pride Lodge" };
    var lines = ['Hi Clarky\'s, I would like to enquire.', 'Place: ' + (labels[d.property] || d.property)];
    if (d.cottage) lines.push('Cottage: ' + d.cottage);
    if (d.arrive) lines.push((d.property === 'lakeside' ? 'Date: ' : 'Arrive: ') + d.arrive);
    if (d.depart) lines.push('Depart: ' + d.depart);
    if (d.time) lines.push('Time: ' + d.time);
    if (d.guests) lines.push('Guests: ' + d.guests);
    if (d.name) lines.push('Name: ' + d.name);
    if (d.phone) lines.push('Phone: ' + d.phone);
    if (d.message) lines.push(d.message);
    window.open('https://wa.me/' + (WA[d.property] || WA.bucketlist) + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  }

  // Property select drives which fields show on the group form
  document.querySelectorAll('form.booking select[name=property]').forEach(function (s) {
    var f = s.form;
    function sync() {
      var v = s.value;
      f.querySelectorAll('[data-for]').forEach(function (el) {
        var on = el.dataset.for.split(' ').indexOf(v) > -1;
        el.style.display = on ? '' : 'none';
        el.querySelectorAll('input,select').forEach(function (i) { i.disabled = !on; });
      });
    }
    s.addEventListener('change', sync); sync();
  });

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();

// "Enquire about <cottage>" buttons preselect that cottage in the form
document.querySelectorAll('[data-cottage]').forEach(function (a) {
  a.addEventListener('click', function () {
    var sel = document.querySelector('form.booking select[name=cottage]');
    if (!sel) return;
    [].forEach.call(sel.options, function (o) { if (o.text.indexOf(a.dataset.cottage) === 0) sel.value = o.value; });
  });
});
