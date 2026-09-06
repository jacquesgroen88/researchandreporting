/* Die Veiling — interaction layer.
   Everything degrades gracefully: with JS off you still get the full
   page, the first hero slide, and every event card. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- scroll reveal ---------------- */
  var rv = $$('.rv');
  if (!('IntersectionObserver' in window) || reduce) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Reveal when it comes into view, and also when it has already been
        // scrolled past — a fast fling or a deep-link jump must never leave
        // content stranded at opacity 0.
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- header solidify ---------------- */
  var hdr = $('header');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- mobile drawer ---------------- */
  var burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.drawer a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- hero slideshow ---------------- */
  var slides = $$('.hero .slide');
  if (slides.length > 1) {
    var dots = $$('.hero .dots button');
    var texts = $$('.hero .rot [data-slide]');
    var i = 0, timer = null;
    var go = function (n) {
      slides[i].classList.remove('on');
      if (dots[i]) dots[i].classList.remove('on');
      if (texts[i]) texts[i].hidden = true;
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on');
      if (dots[i]) dots[i].classList.add('on');
      if (texts[i]) {
        texts[i].hidden = false;
        // retrigger the entrance animation
        texts[i].classList.remove('fade-txt');
        void texts[i].offsetWidth;
        texts[i].classList.add('fade-txt');
      }
    };
    var start = function () { if (!reduce) timer = setInterval(function () { go(i + 1); }, 6800); };
    var stop = function () { clearInterval(timer); };
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { stop(); go(n); start(); });
    });
    start();
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  }

  /* ---------------- count-up stats ---------------- */
  var nums = $$('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        nio.unobserve(e.target);
        var el = e.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1200, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { nio.observe(n); });
  }

  /* ---------------- events: hide past, filter, flag the next one ---------------- */
  var evGrid = $('#evgrid');
  if (evGrid) {
    var now = new Date();
    var cards = $$('.ev', evGrid);
    var live = [];
    cards.forEach(function (c) {
      var when = new Date(c.getAttribute('data-date'));
      // an event stays listed until the end of its day
      var endOfDay = new Date(when.getFullYear(), when.getMonth(), when.getDate(), 23, 59);
      if (endOfDay < now) { c.remove(); } else { live.push(c); }
    });
    if (live.length) {
      var badge = document.createElement('span');
      badge.className = 'next';
      badge.textContent = 'Volgende op';
      var pic = $('.pic', live[0]);
      if (pic) pic.appendChild(badge);
    }
    var empty = $('#evempty');
    // The home page renders the whole calendar but only shows the first few
    // that are still upcoming, so the teaser is never short after past
    // events drop out.
    var max = parseInt(evGrid.getAttribute('data-max'), 10) || Infinity;
    var apply = function (key) {
      var shown = 0;
      live.forEach(function (c) {
        var ok = key === 'all' ||
          c.getAttribute('data-branch') === key ||
          c.getAttribute('data-type') === key;
        if (ok && shown >= max) ok = false;
        c.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    $$('.evfilter button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.evfilter button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        apply(b.getAttribute('data-f'));
      });
    });
    apply(evGrid.getAttribute('data-initial') || 'all');
  }

  /* ---------------- lightbox ---------------- */
  var lb = $('#lb');
  if (lb) {
    var lbImg = $('img', lb), items = $$('[data-lb]'), idx = 0;
    var show = function (n) {
      idx = (n + items.length) % items.length;
      var src = items[idx].getAttribute('data-lb');
      lbImg.src = src;
      lbImg.alt = items[idx].getAttribute('data-alt') || '';
    };
    var open = function (n) {
      show(n); lb.classList.add('on'); document.body.style.overflow = 'hidden';
    };
    var close = function () { lb.classList.remove('on'); document.body.style.overflow = ''; };
    items.forEach(function (el, n) {
      el.addEventListener('click', function () { open(n); });
    });
    $('.x', lb).addEventListener('click', close);
    var prev = $('.prev', lb), next = $('.next', lb);
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  /* ---------------- highlight today's row in the hours tables ---------------- */
  var today = new Date().getDay(); // 0 = Sondag
  var order = ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'];
  $$('.hbox .r').forEach(function (r) {
    var d = $('span', r);
    if (d && d.textContent.trim() === order[today]) r.classList.add('now');
  });
})();
