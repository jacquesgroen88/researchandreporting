// Clarky's v2 motion layer. Runs after main.js. Every effect is skipped for reduced motion,
// and anything gated on IntersectionObserver or requestAnimationFrame has a timer fallback so content can never stay hidden.
(function () {
  window.__motion = true;
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var head = document.querySelector('.site-head'), bar = document.querySelector('.progress');
  var hero = document.querySelector('.hero'), heroImg = hero && hero.querySelector('img.bg'), heroWrap = hero && hero.querySelector('.wrap');
  var bands = [].slice.call(document.querySelectorAll('.band'));

  // Header and progress bar respond to scroll even with reduced motion (they are not animations).
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight, wide = window.innerWidth > 600;
    if (head) head.classList.toggle('scrolled', y > 24);
    var max = root.scrollHeight - h;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (reduce) return;
    if (heroImg && wide && y < h * 1.3) {
      heroImg.style.translate = '0 ' + (y * 0.3).toFixed(1) + 'px';
      if (heroWrap) { heroWrap.style.opacity = Math.max(0, 1 - y / (h * 0.75)).toFixed(3); heroWrap.style.translate = '0 ' + (y * 0.14).toFixed(1) + 'px'; }
    }
    bands.forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      var p = (r.top + r.height / 2 - h / 2) / (h + r.height);
      b.querySelector('.band-bg').style.translate = '0 ' + (p * -16).toFixed(2) + '%';
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();

  if (reduce) return;

  // Split headings into words so each can rise in turn. Only text nodes are wrapped; links and line breaks stay as they are.
  function split(el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = part;
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    el.classList.add('sw');
  }
  document.querySelectorAll('.hero h1, main h2:not(.foot-h), .band-line').forEach(split);

  // Photos uncover as they arrive. The clip sits on the img, the observer watches its wrapper
  // (a clip on the observed element collapses its own intersection box and it never fires).
  document.querySelectorAll('main img.photo').forEach(function (img) {
    if (img.closest('.prop')) return;
    var w = document.createElement('div'); w.className = 'wipe frame';
    img.parentNode.insertBefore(w, img); w.appendChild(img); img.classList.remove('reveal');
  });
  document.querySelectorAll('.prop .media').forEach(function (m) { m.classList.add('wipe'); });
  document.querySelectorAll('.gallery, .pgrid').forEach(function (g) {
    [].forEach.call(g.querySelectorAll('button'), function (b, i) { b.classList.add('wipe'); b.style.setProperty('--d', (i * 0.09) + 's'); });
  });
  document.querySelectorAll('.feat img').forEach(function (img) { img.parentNode.classList.add('wipe'); });

  // Cards in a row arrive one after another.
  document.querySelectorAll('.props, .feats, .reviews, .stats .wrap').forEach(function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.setProperty('--d', (i * 0.12) + 's'); });
  });

  // Count-up numbers. The final value is always written by a timer too, in case animation frames do not run.
  function count(el) {
    var to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, dur = 1700, t0 = null, final = el.dataset.count;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = p < 1 ? (to * e).toFixed(dec) : final;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = final; }, dur + 300);
  }

  function on(el) {
    // A photo waits for its file (up to 1.5 s) so the wipe uncovers the picture, not an empty box.
    var img = el.classList.contains('wipe') && el.querySelector('img');
    if (img && !img.complete && !el.dataset.wait) {
      el.dataset.wait = 1; img.loading = 'eager';
      var go = function () { on(el); }; img.addEventListener('load', go, { once: true }); img.addEventListener('error', go, { once: true }); setTimeout(go, 1500);
      return;
    }
    el.classList.add('in');
    if (el.dataset && el.dataset.count && !el.dataset.done) { el.dataset.done = 1; count(el); }
  }
  var targets = [].slice.call(document.querySelectorAll('.sw, .wipe, [data-count]')).filter(function (el) { return !el.closest('.hero'); });
  var fired = false;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      fired = true;
      es.forEach(function (e) { if (e.isIntersecting) { on(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
    setTimeout(function () { if (!fired) targets.forEach(on); }, 2500);
  } else targets.forEach(on);

  // Hero entrance.
  if (hero) {
    setTimeout(function () {
      hero.classList.add('go');
      hero.querySelectorAll('.sw').forEach(function (h) { h.classList.add('in'); });
    }, 80);
  }

  // Fine pointers only: card tilt and the "View" bubble over photos.
  if (fine) {
    document.querySelectorAll('.prop').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
        c.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('mouseleave', function () { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
    var cur = document.createElement('div'); cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true'); cur.textContent = 'View';
    document.body.appendChild(cur);
    document.addEventListener('mousemove', function (e) { cur.style.translate = e.clientX + 'px ' + e.clientY + 'px'; }, { passive: true });
    document.querySelectorAll('.gallery button, .pgrid button').forEach(function (b) {
      b.addEventListener('mouseenter', function () { cur.classList.add('on'); });
      b.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
      b.addEventListener('click', function () { cur.classList.remove('on'); });
    });
  }

  // Night canvases: twinkling stars with the odd shooting star, or embers rising from the pub fire.
  // They only draw while on screen.
  document.querySelectorAll('canvas.sky').forEach(function (cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var kind = cv.dataset.fx, parts = [], run = false, w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1), shoot = null, nextShoot = 0;
    function make(init) {
      return kind === 'stars'
        ? { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + 0.3, p: Math.random() * 6.28, s: Math.random() * 0.025 + 0.006 }
        : { x: Math.random() * w, y: init ? Math.random() * h : h + 10, r: Math.random() * 1.8 + 0.6, vy: -(Math.random() * 0.7 + 0.35), vx: (Math.random() - 0.5) * 0.3, p: Math.random() * 6.28 };
    }
    function size() {
      var r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = kind === 'stars' ? Math.min(220, Math.round(w * h / 7000)) : Math.min(90, Math.round(w / 16));
      parts = []; for (var i = 0; i < n; i++) parts.push(make(true));
    }
    function draw(t) {
      if (!run) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (kind === 'stars') {
          p.p += p.s;
          ctx.fillStyle = 'rgba(255,246,222,' + (0.25 + 0.6 * Math.abs(Math.sin(p.p))).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        } else {
          p.p += 0.03; p.x += p.vx + Math.sin(p.p) * 0.35; p.y += p.vy;
          var a = Math.max(0, Math.min(1, p.y / h));
          ctx.fillStyle = 'rgba(255,' + (120 + Math.round(90 * a)) + ',50,' + (a * 0.85).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          ctx.fillStyle = 'rgba(255,150,60,' + (a * 0.18).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
          if (p.y < -10) parts[i] = make(false);
        }
      }
      if (kind === 'stars') {
        if (!shoot && t > nextShoot) shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, l: 0 };
        if (shoot) {
          shoot.l += 0.025;
          var x = shoot.x + shoot.l * 260, y = shoot.y + shoot.l * 110;
          var g = ctx.createLinearGradient(x - 90, y - 38, x, y);
          g.addColorStop(0, 'rgba(255,246,222,0)'); g.addColorStop(1, 'rgba(255,246,222,' + (0.9 * (1 - shoot.l)).toFixed(3) + ')');
          ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 90, y - 38); ctx.lineTo(x, y); ctx.stroke();
          if (shoot.l >= 1) { shoot = null; nextShoot = t + 4000 + Math.random() * 5000; }
        }
      }
      requestAnimationFrame(draw);
    }
    size();
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 200); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var was = run; run = es[0].isIntersecting;
        if (run && !was) requestAnimationFrame(draw);
      }).observe(cv);
    }
  });
})();
