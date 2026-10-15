/* MyForeverBaby prototype: cart drawer, add-to-cart mock, gallery, filters, sticky buy bar.
   In Shopify these map to /cart/add.js, /cart/change.js and cart.note (see SCOPE.md). */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("catalog").textContent);
  var ROOT = (document.querySelector('link[href$="assets/site.css"]').getAttribute("href") || "").replace("assets/site.css", "");
  var BY = {};
  DATA.products.forEach(function (p) { BY[p.h] = p; });
  var KEY = "mfb-proto-cart-v1";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- storage (never trusted to exist) ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { items: [], note: "" }; } catch (e) { return { items: [], note: "" }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* private mode: cart lives for this page only */ } }
  var cart = load();

  /* ---------- money + dates ---------- */
  function money(c) { return "R" + Math.round(c / 100).toLocaleString("en-ZA").replace(/\s| /g, ","); }
  var HOL = DATA.holidays;
  function addBD(d, n) {
    d = new Date(d.getTime());
    while (n > 0) {
      d.setDate(d.getDate() + 1);
      var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      if (d.getDay() !== 0 && d.getDay() !== 6 && HOL.indexOf(iso) < 0) n--;
    }
    return d;
  }
  var DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmt(d) { return DAYS[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  var today = new Date(); today.setHours(12, 0, 0, 0);
  function etaText(kind) {
    if (kind === "preorder") return fmt(addBD(today, 10)) + " and " + fmt(addBD(today, 14));
    return fmt(addBD(today, 4));
  }
  $$("[data-eta]").forEach(function (el) {
    el.textContent = el.dataset.eta === "preorder" ? "between " + etaText("preorder") : etaText("instock");
  });

  /* ---------- toast ---------- */
  var toastEl = $("[data-toast]"), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600); }

  /* ---------- dialogs (menu, cart) ---------- */
  function openDlg(id) {
    var d = document.getElementById(id); if (!d) return;
    if (typeof d.showModal === "function") { if (!d.open) d.showModal(); } else d.setAttribute("open", "");
    if (id === "cart") { document.body.classList.add("drawer-open"); renderCart(); }
    $$('[aria-controls="' + id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "true"); });
  }
  function closeDlg(d) {
    if (d.open && typeof d.close === "function") d.close(); else d.removeAttribute("open");
  }
  $$("dialog").forEach(function (d) {
    d.addEventListener("close", function () {
      document.body.classList.remove("drawer-open");
      $$('[aria-controls="' + d.id + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    });
    d.addEventListener("click", function (e) { if (e.target === d) closeDlg(d); });
  });
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"); if (o) { openDlg(o.dataset.open); return; }
    var c = e.target.closest("[data-close]"); if (c) { closeDlg(c.closest("dialog")); }
  });

  /* ---------- cart model ---------- */
  function lineKey(h, vid) { return h + ":" + vid; }
  function variantFor(p, vid) {
    if (vid) return p.v.filter(function (v) { return String(v.id) === String(vid); })[0];
    return p.v.filter(function (v) { return v.a; })[0];
  }
  function add(h, vid, qty) {
    var p = BY[h]; if (!p) return false;
    var v = variantFor(p, vid);
    if (!v || !v.a || p.s === "sold_out") { toast("Sorry, that one is sold out"); return false; }
    var k = lineKey(h, v.id), ex = cart.items.filter(function (i) { return i.k === k; })[0];
    if (ex) ex.q += qty || 1; else cart.items.push({ k: k, h: h, vid: v.id, q: qty || 1 });
    save(); updateCount(); return true;
  }
  function setQty(k, q) {
    cart.items = cart.items.map(function (i) { if (i.k === k) i.q = q; return i; }).filter(function (i) { return i.q > 0; });
    save(); updateCount(); renderCart();
  }
  function count() { return cart.items.reduce(function (s, i) { return s + i.q; }, 0); }
  function updateCount() {
    var n = count();
    $$("[data-cart-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $$(".hdr__cart").forEach(function (b) { b.setAttribute("aria-label", "Open cart, " + n + (n === 1 ? " item" : " items")); });
  }

  /* ---------- add buttons ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b || b.type === "submit") return;
    e.preventDefault();
    var form = b.closest("form"), sel = form && form.querySelector("select");
    if (add(b.dataset.add, sel ? sel.value : null, 1)) afterAdd(b);
  });
  $$("form[data-buy-form], form[data-addon-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var b = f.querySelector("[data-add]"), sel = f.querySelector("select");
      if (b && add(b.dataset.add, sel ? sel.value : null, 1)) afterAdd(b);
    });
  });
  function afterAdd(btn) {
    var inDrawer = btn.closest("#cart");
    if (inDrawer) { renderCart(); toast("Added to your cart"); return; }
    openDlg("cart");
  }

  /* ---------- drawer render ---------- */
  function el(tag, attrs, html) { var x = document.createElement(tag); for (var a in attrs) x.setAttribute(a, attrs[a]); if (html != null) x.innerHTML = html; return x; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function renderCart() {
    var body = $("[data-cart-body]"), foot = $("[data-cart-foot]"), n = count();
    $("[data-cart-count-label]").textContent = n ? "(" + n + ")" : "";
    if (!n) {
      body.innerHTML = '<div class="drawer__empty"><p>Your cart is empty.</p><a class="btn btn--primary" href="' + ROOT + 'collections/all.html#ready">Shop babies ready to ship</a></div>';
      foot.innerHTML = ""; return;
    }
    var total = 0, hasPre = false, hasIn = false, html = "";
    cart.items.forEach(function (i) {
      var p = BY[i.h]; if (!p) return;
      var v = variantFor(p, i.vid); total += p.p * i.q;
      var pre = p.s === "preorder"; if (pre) hasPre = true; else hasIn = true;
      html += '<div class="line"><img src="' + ROOT + p.img + '" alt="" width="72" height="90">' +
        '<div><p class="line__t">' + esc(p.t) + "</p>" + (v && v.t !== "Default Title" ? '<p class="line__v">' + esc(v.t) + "</p>" : "") +
        '<p class="line__state ' + (pre ? "pre" : "in") + '">' + (pre ? "Pre-order · arrives in " + DATA.store.shipPreorder : "In stock · ships in " + DATA.store.shipInStock) + "</p>" +
        '<div class="qty"><button type="button" aria-label="Decrease quantity" data-q="' + i.k + '" data-d="-1"><svg class="ic"><use href="#i-minus"/></svg></button><span aria-live="polite">' + i.q +
        '</span><button type="button" aria-label="Increase quantity" data-q="' + i.k + '" data-d="1"><svg class="ic"><use href="#i-plus"/></svg></button></div> ' +
        '<button class="line__rm" type="button" data-rm="' + i.k + '">Remove</button></div>' +
        '<p class="line__p">' + money(p.p * i.q) + "</p></div>";
    });
    html += addonRow();
    html += '<details class="gift"' + (cart.note ? " open" : "") + '><summary><svg class="ic"><use href="#i-gift"/></svg> Add a gift note (free)</summary>' +
      '<label class="small muted" for="giftnote">We\'ll tuck it into the box.</label><textarea id="giftnote" maxlength="240" data-note>' + esc(cart.note || "") + "</textarea></details>";
    body.innerHTML = html;
    var eta = hasPre
      ? '<div class="eta pre"><svg class="ic"><use href="#i-clock"/></svg><span>' + (hasIn ? "Your in-stock items ship in " + DATA.store.shipInStock + ". Your pre-order baby arrives " : "Your pre-order baby arrives ") + "between " + etaText("preorder") + ".</span></div>"
      : '<div class="eta"><svg class="ic"><use href="#i-truck"/></svg><span>Order today and it ships by ' + etaText("instock") + ".</span></div>";
    foot.innerHTML = '<div class="sum"><span>Delivery</span><span class="free">Free</span></div><div class="sum sum--total"><span>Total</span><span>' + money(total) + "</span></div>" + eta +
      '<button class="btn btn--primary btn--lg btn--block" type="button" data-checkout>Checkout securely</button>' +
      '<div class="foot-assure"><span><svg class="ic"><use href="#i-lock"/></svg> Visa, Mastercard, Instant EFT via Payfast</span><span><svg class="ic"><use href="#i-return"/></svg> ' + DATA.store.returnsDays + "-day returns</span></div>";
  }
  function addonRow() {
    var inCart = cart.items.map(function (i) { return i.h; });
    var hasDoll = cart.items.some(function (i) { return BY[i.h] && BY[i.h].k === "doll"; });
    if (!hasDoll) return "";
    var a = DATA.addonOrder.map(function (h) { return BY[h]; }).filter(function (p) { return p && p.s === "in_stock" && inCart.indexOf(p.h) < 0; })[0];
    if (!a) return "";
    var multi = a.v.length > 1, opts = "";
    if (multi) a.v.forEach(function (v) { opts += '<option value="' + v.id + '"' + (v.a ? "" : " disabled") + ">" + esc(v.t) + (v.a ? "" : " (sold out)") + "</option>"; });
    var firstA = a.v.filter(function (v) { return v.a; })[0];
    return '<div class="d-addon"><p class="d-addon__h">Complete her gift</p><div class="d-addon__row"><img src="' + ROOT + a.img + '" alt="" width="56" height="70" loading="lazy">' +
      "<p><b>" + esc(a.t) + "</b><br>" + money(a.p) + (a.c ? ' <s class="muted">' + money(a.c) + "</s>" : "") + "</p></div>" +
      '<form class="d-addon__act" data-drawer-addon="' + a.h + '">' + (multi ? '<label class="sr" for="d-addon-v" hidden>Size</label><select id="d-addon-v" aria-label="Size">' + opts.replace('value="' + firstA.id + '"', 'value="' + firstA.id + '" selected') + "</select>" : "") +
      '<button class="btn btn--soft btn--sm" type="submit">Add ' + money(a.p) + "</button></form></div>";
  }
  var drawer = document.getElementById("cart");
  drawer.addEventListener("click", function (e) {
    var q = e.target.closest("[data-q]");
    if (q) { var it = cart.items.filter(function (i) { return i.k === q.dataset.q; })[0]; if (it) setQty(it.k, it.q + Number(q.dataset.d)); return; }
    var r = e.target.closest("[data-rm]"); if (r) { setQty(r.dataset.rm, 0); return; }
    if (e.target.closest("[data-checkout]")) {
      toast("Prototype: in Shopify this goes to the secure checkout");
    }
  });
  drawer.addEventListener("submit", function (e) {
    var f = e.target.closest("[data-drawer-addon]"); if (!f) return;
    e.preventDefault();
    var sel = f.querySelector("select");
    if (add(f.dataset.drawerAddon, sel ? sel.value : null, 1)) { renderCart(); toast("Added to your cart"); }
  });
  drawer.addEventListener("input", function (e) { if (e.target.matches("[data-note]")) { cart.note = e.target.value; save(); } });

  /* ---------- gallery ---------- */
  $$("[data-gallery]").forEach(function (g) {
    var track = $("[data-track]", g), thumbs = $$("[data-go]", g), cur = $("[data-cur]", g);
    if (!track) return;
    function idx() { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
    function mark(i) { thumbs.forEach(function (t, k) { t.classList.toggle("is-on", k === i); t.setAttribute("aria-current", k === i ? "true" : "false"); }); if (cur) cur.textContent = i + 1; }
    thumbs.forEach(function (t) { t.addEventListener("click", function () { track.scrollTo({ left: Number(t.dataset.go) * track.clientWidth, behavior: "auto" }); mark(Number(t.dataset.go)); }); });
    var raf; track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { mark(idx()); }); }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var i = Math.max(0, Math.min(thumbs.length - 1, idx() + (e.key === "ArrowRight" ? 1 : -1))); track.scrollTo({ left: i * track.clientWidth }); mark(i); }
    });
  });

  /* ---------- sticky buy bar (scroll-based; IntersectionObserver is unreliable in some embedded panes) ---------- */
  var sticky = $("[data-sticky]"), mainAdd = $("[data-main-add]");
  if (sticky && mainAdd) {
    var mq = window.matchMedia("(max-width:1023px)");
    var onScroll = function () {
      var r = mainAdd.getBoundingClientRect(); var show = mq.matches && (r.bottom < 0 || r.top > window.innerHeight);
      if (show !== !sticky.hidden) { sticky.hidden = !show; document.body.classList.toggle("has-sticky", show); }
    };
    window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); onScroll();
  }

  /* ---------- collection filter chips ---------- */
  var chips = $$("[data-filter]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.dataset.filter;
      chips.forEach(function (x) { var on = x === c; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      $$("[data-group]").forEach(function (g) { g.hidden = f !== "all" && g.dataset.group !== f; });
    });
  });
  if (location.hash === "#preorder" && chips.length) { var pc = chips.filter(function (c) { return c.dataset.filter === "preorder"; })[0]; if (pc) pc.click(); }

  /* ---------- collapsible pre-order grid on mobile ---------- */
  $$(".grid.is-collapsible").forEach(function (g) {
    g.classList.add("is-collapsed");
    var btn = g.parentNode.querySelector("[data-expand]");
    if (btn) btn.addEventListener("click", function () { g.classList.remove("is-collapsed"); btn.remove(); });
  });

  updateCount();
})();
