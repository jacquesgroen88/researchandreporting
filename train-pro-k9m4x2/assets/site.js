/* Train Pro International. No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- reveals
     Deliberately not IntersectionObserver alone: if IO never fires (hidden
     tab, embedded preview, restored session) an IO-only implementation leaves
     the page blank. A rAF-throttled rect check cannot fail that way, and a
     hard timeout reveals everything regardless. */
  var watched = [].slice.call(document.querySelectorAll('.up,.draw,.row,.rise-group'));

  function revealAll() {
    watched.forEach(function (el) { el.classList.add('in'); });
    watched = [];
  }

  function check() {
    check.queued = false;
    var h = window.innerHeight || document.documentElement.clientHeight;
    watched = watched.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.90 && r.bottom > -80) {
        var d = el.getAttribute('data-stagger');
        if (d) { el.style.transitionDelay = (parseInt(d, 10) * 65) + 'ms'; }
        el.classList.add('in');
        return false;
      }
      return true;
    });
    if (!watched.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  function onScroll() {
    if (check.queued) return;
    check.queued = true;
    window.requestAnimationFrame(check);
  }

  if (watched.length) {
    if (reduce) { revealAll(); }
    else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      check();
      window.addEventListener('load', check);
      window.setTimeout(check, 350);
      window.setTimeout(revealAll, 4500);
    }
  }

  /* ------------------------------------------------- hero load sequence
     rAF is the nice path, but it never ticks in a document the browser is not
     rendering (hidden tab, embedded preview). The headline is masked until
     this runs, so it cannot be the only trigger. */
  function startHero() {
    if (startHero.done) return;
    startHero.done = true;
    document.documentElement.classList.add('loaded');
    var hero = document.querySelector('[data-hero]');
    if (hero) hero.classList.add('in');
  }
  if (reduce) startHero();
  else {
    window.requestAnimationFrame(function () { window.requestAnimationFrame(startHero); });
    window.setTimeout(startHero, 140);
  }

  /* ------------------------------------------------- header ink flip */
  var hd = document.querySelector('.hd');
  var flipAt = document.querySelector('[data-flip]');
  if (hd) {
    var flip = function () {
      var trigger = flipAt
        ? flipAt.getBoundingClientRect().bottom - hd.offsetHeight - 4
        : 40 - window.scrollY;
      hd.classList.toggle('is-ink', trigger <= 0);
    };
    flip();
    window.addEventListener('scroll', flip, { passive: true });
    window.addEventListener('resize', flip);
  }

  /* ------------------------------------------------- mobile nav */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setNav = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }

  /* ------------------------------------------------- course index peek
     One image element follows the pointer across the index and swaps source
     per row. Position is eased on rAF so it trails rather than snaps. */
  var index = document.querySelector('[data-index]');
  var peek = document.querySelector('.peek');
  if (index && peek && !reduce && window.matchMedia('(min-width: 901px)').matches) {
    var img = peek.querySelector('img');
    var tx = 0, ty = 0, cx = 0, cy = 0, active = false, raf = null;

    var loop = function () {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      peek.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%) scale(' + (active ? 1 : 0.94) + ')';
      if (active || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = window.requestAnimationFrame(loop);
      else raf = null;
    };
    var kick = function () { if (!raf) raf = window.requestAnimationFrame(loop); };

    index.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY; kick();
    });

    [].slice.call(index.querySelectorAll('.row')).forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        var src = row.getAttribute('data-peek');
        if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        var pos = row.getAttribute('data-peek-pos');
        if (pos) img.style.objectPosition = pos;
        active = true; peek.classList.add('on'); kick();
      });
      row.addEventListener('pointerleave', function () {
        active = false; peek.classList.remove('on'); kick();
      });
    });
    index.addEventListener('pointerleave', function () {
      active = false; peek.classList.remove('on'); kick();
    });
  }

  /* ------------------------------------------------- course filters */
  var chips = document.querySelectorAll('[data-filter]');
  var rows = document.querySelectorAll('[data-track]');
  var counter = document.getElementById('course-count');
  if (chips.length && rows.length) {
    [].slice.call(chips).forEach(function (chip) {
      chip.addEventListener('click', function () {
        var want = chip.getAttribute('data-filter');
        [].slice.call(chips).forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        var shown = 0;
        [].slice.call(rows).forEach(function (row) {
          var hit = want === 'all' || row.getAttribute('data-track') === want;
          row.style.display = hit ? '' : 'none';
          if (hit) shown++;
        });
        if (counter) counter.textContent = shown + (shown === 1 ? ' course' : ' courses');
      });
    });
  }

  /* ------------------------------------------------- enquiry form */
  var sel = document.getElementById('f-course');
  if (sel) {
    var qs = new URLSearchParams(window.location.search).get('course');
    var pre = sel.getAttribute('data-preselect') || qs;
    if (pre && [].some.call(sel.options, function (o) { return o.value === pre; })) sel.value = pre;
  }

  [].slice.call(document.querySelectorAll('form[data-demo]')).forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var note = form.querySelector('.form-result');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending'; }
      window.setTimeout(function () {
        if (note) {
          note.hidden = false;
          note.textContent = 'Your enquiry is in. You will get a written reply with dates and a quote. '
            + '(Prototype: nothing was sent.)';
        }
        if (btn) btn.textContent = 'Enquiry sent';
      }, 520);
    });
  });

  /* ------------------------------------------------- year */
  [].slice.call(document.querySelectorAll('[data-year]')).forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
