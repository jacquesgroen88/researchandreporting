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

  var PEOPLE = ['Jade', 'Jacques'];
  var STATUS = { done: 'Done', check: 'Done, please check', waiting: 'Waiting on you' };
  var STATUS_OPTS = [['open', 'Open'], ['done', 'Done'], ['check', 'Done, please check'], ['waiting', 'Waiting on you']];
  var EKEY = null;
  try { EKEY = localStorage.getItem('nm-editor-key'); } catch (e) {}
  var EDITOR_PARAM = (location.search + location.hash).match(/[?#&]editor(=off)?\b/);
  function rpc(fn, body) {
    return fetch(API.replace(/\/acreage_notes$/, '') + '/rpc/' + fn, {
      method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ('HTTP ' + r.status)); });
      return r.json();
    });
  }
  function editor() { return !!EKEY; }
  function setEditor(k) {
    EKEY = k || null;
    try { k ? localStorage.setItem('nm-editor-key', k) : localStorage.removeItem('nm-editor-key'); } catch (e) {}
    document.body.classList.toggle('nm-editor', !!k);
  }
  function canEdit(n) { return editor() && n.kind === 'agency'; }
  function editBtn(n) { return canEdit(n) ? ' <button type="button" class="nm-editbtn" data-id="' + n.id + '">Edit</button>' : ''; }
  function edited(n) { return n.edited_at ? ' &middot; edited' : ''; }
  function chip(s) { return STATUS[s] ? '<span class="nm-st nm-st-' + s + '">' + STATUS[s] + '</span>' : ''; }
  var all = [];
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
      .then(function (rows) {
        all = rows;
        notes = rows.filter(function (r) { return !r.parent_id; });
        return rows;
      });
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
  /* Things that drive the page rather than say anything. Note mode has to let
     these through or she cannot reach the second frame of a slider, and most
     of the photographs live in sliders. */
  function isControl(el) {
    if (!el || !el.closest) return false;
    if (el.closest('.dots, .sl-arrow, .menu-btn, .lb .prev, .lb .next, .lb .close')) return true;
    return false;
  }
  function target(el) {
    var hops = 0;
    if (isControl(el)) return null;
    while (el && el !== document.body && hops < 8) {
      if (el.closest && el.closest('.nm-ui, #nmbar, #nmlist, .nm-pin, #nmtip')) return null;
      var txt = (el.textContent || '').trim();
      if (GOOD.test(el.tagName) && (txt.length || el.tagName === 'IMG' || el.tagName === 'VIDEO')) return el;
      /* a wrapper holding one picture and nothing to read is that picture */
      if (!txt.length && el.querySelectorAll && el.querySelectorAll('img').length === 1) return el;
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
    '<span class="nm-lead">' + (document.body.getAttribute('data-nm-lead') || 'The Acreage &middot; review copy') + '</span>' +
    '<span class="nm-sp"></span>' +
    '<button type="button" id="nmlistbtn">Notes<span class="nm-count" id="nmcount">0</span></button>' +
    '<button type="button" id="nmtoggle">Leave a note</button>';
  document.body.appendChild(bar);

  var hint = document.createElement('div');
  hint.id = 'nmhint';
  hint.textContent = 'Click anything to comment on it, photographs included';
  document.body.appendChild(hint);

  var tip = document.createElement('div');
  tip.id = 'nmtip';
  document.body.appendChild(tip);

  var panel = document.createElement('aside');
  panel.id = 'nmlist';
  panel.innerHTML =
    '<div class="nm-head"><b>Notes on this page</b><button type="button" aria-label="Close">&times;</button></div>' +
    '<div class="nm-sum"></div><div class="nm-items"></div>' +
    '<div class="nm-foot">Jacques can see these as soon as you save them.</div>';
  document.body.appendChild(panel);

  if (EKEY) document.body.classList.add('nm-editor');
  if (EDITOR_PARAM && EDITOR_PARAM[1]) { setEditor(null); }
  else if (EDITOR_PARAM && !EKEY) {
    var k = window.prompt('Editor passcode');
    if (k) rpc('acreage_editor_check', { p_key: k.trim() }).then(function (ok) {
      if (ok === true) { setEditor(k.trim()); render(); } else { alert('That passcode did not work.'); }
    }).catch(function () { alert('Could not check the passcode. Try again.'); });
  }
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
    if (!on) tip.classList.remove('nm-tipon');
    toggle.textContent = on ? 'Done' : 'Leave a note';
    toggle.classList.toggle('nm-primary', on);
    clearHi(); close();
  }

  /* ── hover highlight and click to comment ──────────────────────────── */
  var hi = null;
  function clearHi() { if (hi) { hi.classList.remove('nm-hi'); hi.classList.remove('nm-hipic'); hi = null; } }
  document.addEventListener('mousemove', function (e) {
    if (!on || composer || bubble) { tip.classList.remove('nm-tipon'); return; }
    var el = target(e.target);
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 16) + 'px';
    tip.classList.toggle('nm-tipon', !!el);
    if (el) tip.textContent = pictureIn(el) ? 'Comment on this photograph' : 'Comment on this';
    if (el === hi) return;
    clearHi();
    if (el) { hi = el; hi.classList.add('nm-hi'); hi.classList.toggle('nm-hipic', !!pictureIn(el)); }
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
    tip.classList.remove('nm-tipon');
    if (composer) { composer.remove(); composer = null; }
    if (bubble) { bubble.remove(); bubble = null; }
  }
  function place(node, x, y) {
    node.style.left = Math.max(10, Math.min(x, document.documentElement.clientWidth - 344)) + 'px';
    node.style.top = (y + 12) + 'px';
  }
  /* the picture inside whatever was clicked, if there is exactly one */
  function pictureIn(el) {
    if (el.tagName === 'IMG') return el;
    var imgs = el.querySelectorAll ? el.querySelectorAll('img') : [];
    return imgs.length === 1 ? imgs[0] : null;
  }
  function fileOf(img) {
    var src = img.getAttribute('src') || '';
    return src.split('/').pop().split('?')[0];
  }
  var PIC_TAGS = ['Crop it differently', 'Zoom in on the subject', 'Use a different picture',
                  'Wrong picture for this spot', 'Too dark', 'Show more of the view'];

  function openComposer(el, x, y) {
    close();
    var img = pictureIn(el);
    var quote = (el.textContent || el.getAttribute('alt') || el.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, 120);
    if (img) {
      var alt = (img.getAttribute('alt') || '').trim();
      quote = (alt ? alt + ' · ' : '') + fileOf(img);
    }
    composer = document.createElement('div');
    composer.className = 'nm-ui';
    composer.innerHTML =
      (img ? '<div class="nm-shot"><img src="' + esc(img.getAttribute('src')) + '" alt="">' +
             '<div><b>This picture</b><span>' + esc(fileOf(img)) + '</span></div></div>'
           : '<div class="nm-q"><b>On:</b> ' + esc(quote) + '</div>') +
      '<div class="nm-body">' +
      (img ? '<div class="nm-tags">' + PIC_TAGS.map(function (t) {
               return '<button type="button" class="nm-tag">' + esc(t) + '</button>'; }).join('') + '</div>' : '') +
      '<textarea placeholder="' + (img ? 'What should we do with this picture?'
                                       : 'What would you like changed here?') + '"></textarea>' +
      '<label class="nm-wholbl">Commenting as' +
      '<select class="nm-who">' + PEOPLE.map(function (p) {
        return '<option' + (p === who() ? ' selected' : '') + '>' + esc(p) + '</option>';
      }).join('') + '</select></label>' +
      '<div class="nm-err"></div>' +
      '<div class="nm-row"><button type="button" class="nm-cancel">Cancel</button>' +
      '<button type="button" class="nm-save">Save note</button></div>' +
      '</div>';
    document.body.appendChild(composer);
    place(composer, x, y);
    var ta = composer.querySelector('textarea'); ta.focus();
    Array.prototype.forEach.call(composer.querySelectorAll('.nm-tag'), function (b) {
      b.onclick = function () {
        b.classList.toggle('nm-tagon');
        var picked = Array.prototype.map.call(composer.querySelectorAll('.nm-tag.nm-tagon'),
                       function (x) { return x.textContent; });
        var rest = ta.value.split('\n\n').slice(1).join('\n\n');
        ta.value = picked.length ? picked.join('. ') + (rest ? '\n\n' + rest : '') : rest;
        ta.focus();
      };
    });
    composer.querySelector('.nm-cancel').onclick = function () { close(); clearHi(); };
    composer.querySelector('.nm-save').onclick = function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      var name = composer.querySelector('.nm-who').value || PEOPLE[0];
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
    var thread = repliesTo(note.id).map(function (rp) {
      return '<div class="nm-reply" data-id="' + rp.id + '"><div class="nm-meta' + (rp.kind === 'agency' ? ' nm-ameta' : '') + '">' +
             esc(rp.author || 'Jade') + ' &middot; ' + when(rp.created_at) + edited(rp) + editBtn(rp) + '</div>' +
             '<div class="nm-text">' + esc(rp.note) + '</div></div>';
    }).join('');

    bubble = document.createElement('div');
    bubble.className = 'nm-ui nm-thread';
    bubble.innerHTML =
      '<div class="nm-q"><b>On:</b> ' + esc(note.quote || '') + '</div>' +
      '<div class="nm-body"><div class="nm-meta' + (note.kind === 'agency' ? ' nm-ameta' : '') + '">' +
      esc(note.author || 'Jade') + (note.kind === 'agency' ? ' &middot; suggestion' : '') +
      ' &middot; ' + when(note.created_at) + edited(note) + editBtn(note) + '</div>' + chip(note.status) +
      (editor() ? '<label class="nm-stlbl">Status <select class="nm-stsel">' + STATUS_OPTS.map(function (o) {
        return '<option value="' + o[0] + '"' + ((note.status || 'open') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></label>' : '') +
      '<div class="nm-text" data-id="' + note.id + '">' + esc(note.note) + '</div>' +
      '<div class="nm-thread-list">' + thread + '</div>' +
      '<div class="nm-replybox">' +
        '<textarea class="nm-rt" placeholder="Reply"></textarea>' +
        '<label class="nm-wholbl">Replying as' +
        '<select class="nm-who">' + PEOPLE.map(function (p) {
          return '<option' + (p === who() ? ' selected' : '') + '>' + esc(p) + '</option>';
        }).join('') + '</select></label>' +
        '<div class="nm-err"></div>' +
        '<div class="nm-row"><button type="button" class="nm-cancel">Close</button>' +
        '<button type="button" class="nm-save nm-sendreply">Reply</button></div>' +
      '</div></div>';
    document.body.appendChild(bubble);
    var r = el ? el.getBoundingClientRect() : { left: 40, bottom: 80 };
    place(bubble, r.left + window.scrollX, r.bottom + window.scrollY);
    bubble.querySelector('.nm-cancel').onclick = close;
    wireEditing(note, el);

    bubble.querySelector('.nm-sendreply').onclick = function () {
      var ta = bubble.querySelector('.nm-rt');
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      var name = bubble.querySelector('.nm-who').value || PEOPLE[0];
      try { localStorage.setItem('nm-who', name); } catch (err) {}
      var btn = this; btn.disabled = true; btn.textContent = 'Sending';
      save({ page: PAGE, parent_id: note.id, note: text, author: name,
             quote: note.quote, anchor: note.anchor })
        .then(function (rows) {
          all.push(rows[0] || rows);
          openBubble(note, el);            /* redraw with the new reply in it */
          render();
        })
        .catch(function (err) {
          btn.disabled = false; btn.textContent = 'Reply';
          var e2 = bubble.querySelector('.nm-err');
          e2.style.display = 'block';
          e2.textContent = 'That did not send. Try again in a moment.';
          if (window.console) console.error('[notes]', err);
        });
    };
  }

  function byId(id) { for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  function refresh(row) {
    for (var i = 0; i < all.length; i++) if (all[i].id === row.id) all[i] = row;
    for (var j = 0; j < notes.length; j++) if (notes[j].id === row.id) notes[j] = row;
  }
  function wireEditing(note, el) {
    if (!editor() || !bubble) return;
    var sel = bubble.querySelector('.nm-stsel');
    if (sel) sel.onchange = function () {
      sel.disabled = true;
      rpc('acreage_agency_edit', { p_key: EKEY, p_id: note.id, p_status: sel.value })
        .then(function (row) { refresh(row); openBubble(byId(note.id), el); render(); })
        .catch(function (err) { sel.disabled = false; alert('Status not saved. ' + (err.message || '')); });
    };
    Array.prototype.forEach.call(bubble.querySelectorAll('.nm-editbtn'), function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-id'), row = byId(id);
        var box = b.closest('.nm-reply') ? b.closest('.nm-reply').querySelector('.nm-text')
                                         : bubble.querySelector('.nm-body > .nm-text');
        if (!row || !box || box.querySelector('textarea')) return;
        box.innerHTML = '<textarea class="nm-et"></textarea>' +
          '<div class="nm-row"><button type="button" class="nm-ecancel">Cancel</button>' +
          '<button type="button" class="nm-save nm-esave">Save edit</button></div>';
        var ta = box.querySelector('textarea'); ta.value = row.note; ta.focus();
        box.querySelector('.nm-ecancel').onclick = function () { openBubble(byId(note.id), el); };
        box.querySelector('.nm-esave').onclick = function () {
          var t = ta.value.trim(); if (!t) { ta.focus(); return; }
          var sv = this; sv.disabled = true; sv.textContent = 'Saving';
          rpc('acreage_agency_edit', { p_key: EKEY, p_id: id, p_note: t })
            .then(function (r2) { refresh(r2); openBubble(byId(note.id), el); render(); })
            .catch(function (err) { sv.disabled = false; sv.textContent = 'Save edit'; alert('Edit not saved. ' + (err.message || '')); });
        };
      };
    });
  }

  /* ── drawing pins and the list ─────────────────────────────────────── */
  function render() {
    Array.prototype.forEach.call(document.querySelectorAll('.nm-pin'), function (p) { p.remove(); });
    countEl.textContent = notes.length;
    var sum = panel.querySelector('.nm-sum'), c = { done: 0, check: 0, waiting: 0 };
    notes.forEach(function (n) { if (c[n.status] != null) c[n.status]++; });
    sum.innerHTML = (c.done + c.check + c.waiting)
      ? chip('done') + ' ' + c.done + ' &nbsp; ' + chip('check') + ' ' + c.check + ' &nbsp; ' + chip('waiting') + ' ' + c.waiting
      : '';
    items.innerHTML = '';
    if (!notes.length) {
      items.innerHTML = '<div class="nm-empty">No notes on this page yet. Press <b>Leave a note</b>, then click whatever you want changed.</div>';
    }
    notes.forEach(function (note, i) {
      var el = find(note);
      if (el && onScreenIn(el)) {
        var r = el.getBoundingClientRect();
        var pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'nm-pin' + (note.kind === 'agency' ? ' nm-agency' : '') +
                        (note.status === 'done' ? ' nm-done' : '') +
                        (note.status === 'check' ? ' nm-check' : '') +
                        (note.status === 'waiting' ? ' nm-waiting' : '');
        pin.textContent = i + 1;
        pin.title = note.note.slice(0, 80);
        /* never past the right edge: a pin poking out widens the page, and a
           phone or tablet then zooms out and shows a white strip */
        pin.style.left = (Math.min(r.right, document.documentElement.clientWidth - 30) + window.scrollX) + 'px';
        pin.style.top = (r.top + window.scrollY) + 'px';
        pin.onclick = function (ev) { ev.stopPropagation(); openBubble(note, el); };
        document.body.appendChild(pin);
      }
      var row = document.createElement('button');
      row.type = 'button'; row.className = 'nm-item';
      row.className = 'nm-item' + (note.kind === 'agency' ? ' nm-agencyrow' : '');
      row.innerHTML = '<span class="n">' + (i + 1) + ' &middot; ' + esc(note.author || 'Jade') +
                      (note.kind === 'agency' ? ' &middot; suggestion' : '') + '</span>' +
                      '<span class="q">' + esc(note.quote || 'On the page') + '</span>' +
                      '<span class="t">' + esc(note.note) + '</span>' + chip(note.status) +
                      (repliesTo(note.id).length
                        ? '<span class="nm-rc">' + repliesTo(note.id).length + ' repl' +
                          (repliesTo(note.id).length === 1 ? 'y' : 'ies') + '</span>' : '');
      row.onclick = function () {
        var t = find(note);
        if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); setTimeout(function () { openBubble(note, t); }, 420); }
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
  window.addEventListener('scroll', function (e) {
    if (e.target !== document && e.target.classList && e.target.classList.contains('track')) reflow();
  }, true);

  /* true when the element is inside the visible part of every scrolling
     ancestor it sits in. A slider frame that has been scrolled past is not. */
  function onScreenIn(el) {
    var r = el.getBoundingClientRect(), n = el.parentElement;
    if (!r.width) return false;
    while (n && n !== document.body) {
      if (n.scrollWidth > n.clientWidth + 4 || n.scrollHeight > n.clientHeight + 4) {
        var b = n.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) return false;
      }
      n = n.parentElement;
    }
    return true;
  }
  if (window.ResizeObserver) new ResizeObserver(reflow).observe(document.body);

  /* ── helpers ───────────────────────────────────────────────────────── */
  function repliesTo(id) {
    return all.filter(function (r) { return r.parent_id === id; })
              .sort(function (a, b) { return a.created_at < b.created_at ? -1 : 1; });
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function who() {
    var v; try { v = localStorage.getItem('nm-who'); } catch (e) {}
    return PEOPLE.indexOf(v) > -1 ? v : PEOPLE[0];   /* Jade unless told otherwise */
  }
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
