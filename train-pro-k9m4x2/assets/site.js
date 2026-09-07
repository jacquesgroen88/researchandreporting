/* Train Pro International — site behaviour. No dependencies. */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mobile-nav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mnav.classList.toggle('open', !open);
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        mnav.classList.remove('open');
      }
    });
  }

  /* ---------- course filters ---------- */
  var chips = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('[data-track]');
  var count = document.getElementById('course-count');
  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var shown = 0;
        cards.forEach(function (card) {
          var hit = want === 'all' || card.getAttribute('data-track') === want;
          card.style.display = hit ? '' : 'none';
          if (hit) shown++;
        });
        if (count) {
          count.textContent = shown + (shown === 1 ? ' course' : ' courses');
        }
      });
    });
  }

  /* ---------- reveal on scroll ----------
     Deliberately not IntersectionObserver-only: if IO never fires (hidden tab,
     embedded preview, restored session) an IO-only implementation leaves the
     whole page invisible. A rAF-throttled rect check cannot fail that way, and
     a hard timeout reveals everything regardless. */
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (rv.length) {
    var ticking = false;

    function revealAll() {
      rv.forEach(function (el) { el.classList.add('in'); });
      rv = [];
    }

    function check() {
      ticking = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      rv = rv.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) { el.classList.add('in'); return false; }
        return true;
      });
      if (!rv.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
    window.addEventListener('load', check);
    window.setTimeout(check, 400);
    window.setTimeout(revealAll, 4000);   // last-resort safety net
  }

  /* ---------- enquiry form: prefill course from ?course= or data attribute ---------- */
  var sel = document.getElementById('f-course');
  if (sel) {
    var qs = new URLSearchParams(window.location.search).get('course');
    var pre = sel.getAttribute('data-preselect') || qs;
    if (pre) {
      var found = Array.prototype.some.call(sel.options, function (o) { return o.value === pre; });
      if (found) sel.value = pre;
    }
  }

  /* ---------- demo form submit ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var note = form.querySelector('.form-result');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending'; }
      window.setTimeout(function () {
        if (note) {
          note.hidden = false;
          note.textContent =
            'Thanks — your enquiry is in. You will get a written reply with dates and a quote, not a call-back to book a call. ' +
            '(Prototype: no message was actually sent.)';
        }
        if (btn) { btn.textContent = 'Enquiry sent'; }
      }, 550);
    });
  });

  /* ---------- current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
