/* ─────────────────────────────────────────────────────────────────────────
   Note mode for the Acreage review copies.

   Turn it on from the bar, click anything on the page, type a comment. The
   comment is stored centrally against a path to the element plus a snippet
   of its text, so the pins come back for whoever opens the link next.

   The key is publishable and the table only allows insert and select, so a
   comment can be added and read but never quietly edited or deleted.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var API  = 'https://plinxeaiapsskkvblbar.supabase.co/rest/v1/acreage_notes';
  var KEY  = 'sb_publishable_qFYgdq9_Oc-_rD0y7JR_4A_HngmfHJF';
  var PAGE = (document.body.getAttribute('data-nm-page') || 'index');

  var notes = [], on = false, composer = null, bubble = null;

  /* ── talking to the store ──────────────────────────────────────────── */
  function headers(extra) {
    var h = { apikey: KEY, Authorization: 'Bearer ' + KEY };
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  function load() {
    return fetch(API + '?page=eq.' + PAGE + '&order=created_at.asc&select=*',
                 { headers: headers({}) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (rows) { notes = rows; return rows; });
  }
  function save(row) {
    return fetch(API, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify(row)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
      return r.json();
    });
  }

  /* ── finding the thing that was clicked ────────────────────────────── */
  var GOOD = /^(H1|H2|H3|H4|H5|P|LI|IMG|FIGURE|FIGCAPTION|BLOCKQUOTE|TD|TH|BUTTON|A|SPAN|B|STRONG|EM|I|DD|DT|LABEL|SUMMARY|VIDEO)$/;
  function target(el) {
    var hops = 0;
    while (el && el !== document.body && hops < 8) {
      if (el.closest && el.closest('.nm-ui, #nmbar, #nmlist, .nm-pin')) return null;
      var txt = (el.textContent || '').trim();
      if (GOOD.test(el.tagName) && (txt.length || el.tagName === 'IMG' || el.tagName === 'VIDEO')) return el;
      if (txt.length > 0 && txt.length < 320 && el.children.length <= 2) return el;
      el = el.parentElement; hops++;
    }
    return null;
  }

  /* A path we can find again next time. Anchored on the nearest id so it
     survives edits elsewhere on the page. */
  function pathOf(el) {
    var parts = [], n = el;
    while (n && n !== document.body) {
      if (n.id) { parts.unshift('#' + n.id); break; }
      var p = n.parentElement; if (!p) break;
      var same = Array.prototype.filter.call(p.children, function (c) { return c.tagName === n.tagName; });
      parts.unshift(n.tagName.toLowerCase() + (same.length > 1 ? ':nth-of-type(' + (same.indexOf(n) + 1) + ')' : ''));
      n = p;
    }
    return parts.join(' > ');
  }
  function find(note) {
    if (note.anchor) {
      try { var el = document.querySelector(note.anchor); if (el) return el; } catch (e) {}
    }
    if (note.quote) {                       /* the page moved; match on the words */
      var want = note.quote.trim().slice(0, 60);
      var all = document.querySelectorAll('h1,h2,h3,h4,p,li,figcaption,button,a,td,span,b');
      for (var i = 0; i < all.length; i++) {
        if ((all[i].textContent || '').trim().indexOf(want) === 0) return all[i];
      }
    }
    return null;
  }

  /* ── chrome ────────────────────────────────────────────────────────── */
  var bar = document.createElement('div');
  bar.id = 'nmbar';
  bar.innerHTML =
    '<span class="nm-lead">The Acreage &middot; review copy</span>' +
    '<span class="nm-sp"></span>' +
    '<button type="button" id="nmlistbtn">Notes<span class="nm-count" id="nmcount">0</span></button>' +
    '<button type="button" id="nmtoggle">Leave a note</button>';
  document.body.appendChild(bar);

  var hint = document.createElement('div');
  hint.id = 'nmhint';
  hint.textContent = 'Click anything on the page to comment on it';
  document.body.appendChild(hint);

  var panel = document.createElement('aside');
  panel.id = 'nmlist';
  panel.innerHTML =
    '<div class="nm-head"><b>Notes on this page</b><button type="button" aria-label="Close">&times;</button></div>' +
    '<div class="nm-items"></div>' +
    '<div class="nm-foot">Jacques can see these as soon as you save them.</div>';
  document.body.appendChild(panel);

  var toggle = bar.querySelector('#nmtoggle');
  var countEl = bar.querySelector('#nmcount');
  var items = panel.querySelector('.nm-items');
  panel.querySelector('.nm-head button').onclick = function () { panel.classList.remove('nm-open'); };
  bar.querySelector('#nmlistbtn').onclick = function () { panel.classList.toggle('nm-open'); };

  toggle.onclick = function () { setMode(!on); };
  var hintTimer = null;
  function setMode(v) {
    on = v;
    document.body.classList.toggle('nm-on', on);
    /* the hint has said its piece after a few seconds */
    clearTimeout(hintTimer); hint.classList.remove('nm-fade');
    if (on) hintTimer = setTimeout(function () { hint.classList.add('nm-fade'); }, 4500);
    toggle.textContent = on ? 'Done' : 'Leave a note';
    toggle.classList.toggle('nm-primary', on);
    clearHi(); close();
  }

  /* ── hover highlight and click to comment ──────────────────────────── */
  var hi = null;
  function clearHi() { if (hi) { hi.classList.remove('nm-hi'); hi = null; } }
  document.addEventListener('mousemove', function (e) {
    if (!on) return;
    var el = target(e.target);
    if (el === hi) return;
    clearHi();
    if (el) { hi = el; hi.classList.add('nm-hi'); }
  }, true);

  document.addEventListener('click', function (e) {
    if (!on) return;
    if (e.target.closest && e.target.closest('#nmbar,#nmlist,.nm-ui,.nm-pin')) return;
    var el = target(e.target);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();       /* the page must not act on this click */
    openComposer(el, e.pageX, e.pageY);
  }, true);

  /* ── composer ──────────────────────────────────────────────────────── */
  function close() {
    if (composer) { composer.remove(); composer = null; }
    if (bubble) { bubble.remove(); bubble = null; }
  }
  function place(node, x, y) {
    node.style.left = Math.max(10, Math.min(x, document.documentElement.clientWidth - 344)) + 'px';
    node.style.top = (y + 12) + 'px';
  }
  function openComposer(el, x, y) {
    close();
    var quote = (el.textContent || el.getAttribute('alt') || el.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, 120);
    composer = document.createElement('div');
    composer.className = 'nm-ui';
    composer.innerHTML =
      '<div class="nm-q"><b>On:</b> ' + esc(quote) + '</div>' +
      '<div class="nm-body">' +
      '<textarea placeholder="What would you like changed here?"></textarea>' +
      '<input type="text" class="nm-who" placeholder="Your name" value="' + esc(who()) + '">' +
      '<div class="nm-err"></div>' +
      '<div class="nm-row"><button type="button" class="nm-cancel">Cancel</button>' +
      '<button type="button" class="nm-save">Save note</button></div>' +
      '</div>';
    document.body.appendChild(composer);
    place(composer, x, y);
    var ta = composer.querySelector('textarea'); ta.focus();
    composer.querySelector('.nm-cancel').onclick = function () { close(); clearHi(); };
    composer.querySelector('.nm-save').onclick = function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      var name = composer.querySelector('.nm-who').value.trim() || 'Jade';
      try { localStorage.setItem('nm-who', name); } catch (err) {}
      var btn = this; btn.disabled = true; btn.textContent = 'Saving';
      save({ page: PAGE, anchor: pathOf(el), quote: quote, note: text, author: name, x: x, y: y })
        .then(function (rows) {
          notes.push(rows[0] || rows);
          close(); clearHi(); render();
        })
        .catch(function (err) {
          btn.disabled = false; btn.textContent = 'Save note';
          var e2 = composer.querySelector('.nm-err');
          e2.style.display = 'block';
          e2.textContent = 'That did not save. Check your connection and try again.';
          if (window.console) console.error('[notes]', err);
        });
    };
  }

  function openBubble(note, el) {
    close();
    bubble = document.createElement('div');
    bubble.className = 'nm-ui';
    bubble.innerHTML =
      '<div class="nm-q"><b>On:</b> ' + esc(note.quote || '') + '</div>' +
      '<div class="nm-body"><div class="nm-meta">' + esc(note.author || 'Jade') + ' &middot; ' +
      when(note.created_at) + '</div><div class="nm-text">' + esc(note.note) + '</div>' +
      '<div class="nm-row"><button type="button" class="nm-cancel">Close</button></div></div>';
    document.body.appendChild(bubble);
    var r = el ? el.getBoundingClientRect() : { left: 40, bottom: 80 };
    place(bubble, r.left + window.scrollX, r.bottom + window.scrollY);
    bubble.querySelector('.nm-cancel').onclick = close;
  }

  /* ── drawing pins and the list ─────────────────────────────────────── */
  function render() {
    Array.prototype.forEach.call(document.querySelectorAll('.nm-pin'), function (p) { p.remove(); });
    countEl.textContent = notes.length;
    items.innerHTML = '';
    if (!notes.length) {
      items.innerHTML = '<div class="nm-empty">No notes on this page yet. Press <b>Leave a note</b>, then click whatever you want changed.</div>';
    }
    notes.forEach(function (note, i) {
      var el = find(note);
      if (el) {
        var r = el.getBoundingClientRect();
        var pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'nm-pin' + (note.status === 'done' ? ' nm-done' : '');
        pin.textContent = i + 1;
        pin.title = note.note.slice(0, 80);
        pin.style.left = (r.right + window.scrollX) + 'px';
        pin.style.top = (r.top + window.scrollY) + 'px';
        pin.onclick = function (ev) { ev.stopPropagation(); openBubble(note, el); };
        document.body.appendChild(pin);
      }
      var row = document.createElement('button');
      row.type = 'button'; row.className = 'nm-item';
      row.innerHTML = '<span class="n">' + (i + 1) + ' &middot; ' + esc(note.author || 'Jade') + '</span>' +
                      '<span class="q">' + esc(note.quote || 'On the page') + '</span>' +
                      '<span class="t">' + esc(note.note) + '</span>';
      row.onclick = function () {
        var t = find(note);
        if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { openBubble(note, t); }, 420); }
        else { openBubble(note, null); }
        if (window.innerWidth < 760) panel.classList.remove('nm-open');
      };
      items.appendChild(row);
    });
  }

  /* pins are positioned in document space, so they have to be redrawn when
     the layout moves under them */
  var t = null;
  function reflow() { clearTimeout(t); t = setTimeout(render, 160); }
  window.addEventListener('resize', reflow);
  window.addEventListener('load', reflow);
  if (window.ResizeObserver) new ResizeObserver(reflow).observe(document.body);

  /* ── helpers ───────────────────────────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function who() { try { return localStorage.getItem('nm-who') || ''; } catch (e) { return ''; } }
  function when(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) + ' ' +
           d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); if (on) setMode(false); panel.classList.remove('nm-open'); }
  });

  load().then(render).catch(function (err) {
    countEl.textContent = '!';
    items.innerHTML = '<div class="nm-empty">Could not load the notes. Refresh the page and they should come back.</div>';
    if (window.console) console.error('[notes] load failed', err);
  });
})();
