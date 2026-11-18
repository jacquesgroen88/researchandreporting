// Reptilia prototype interactions: menu, side cart, size chips, kit totals, demo forms. Nothing is sent anywhere.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) {
    n = Math.round(n * 100) / 100;
    var s = n % 1 ? n.toFixed(2) : String(Math.round(n));
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return 'R' + parts.join('.');
  };

  var mb = $('.menu-btn');
  if (mb) mb.addEventListener('click', function () { $('.nav').classList.toggle('open'); });

  function openCart() { document.body.classList.add('cart-open'); }
  function closeCart() { document.body.classList.remove('cart-open'); }
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); var n = $('.ib .n'); if (n && b.hasAttribute('data-add')) n.textContent = (+n.textContent || 0) + 1; openCart(); }); });
  $$('[data-close-cart]').forEach(function (b) { b.addEventListener('click', closeCart); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  // size / option chips with live price
  $$('.opts').forEach(function (g) {
    $$('.opt', g).forEach(function (o) {
      o.addEventListener('click', function () {
        if (o.disabled) return;
        $$('.opt', g).forEach(function (x) { x.classList.remove('on'); });
        o.classList.add('on');
        var target = g.getAttribute('data-price-target');
        if (target && o.dataset.price) { $$(target).forEach(function (el) { el.textContent = money(+o.dataset.price); }); }
        recalcQty();
      });
    });
  });
  function recalcQty() {
    var q = $('.qty input'); var on = $('.opts[data-price-target] .opt.on'); var out = $$('[data-line-total]');
    if (!q || !on || !out.length) return;
    out.forEach(function (el) { el.textContent = money((+on.dataset.price) * Math.max(1, +q.value || 1)); });
  }
  $$('.qty').forEach(function (w) {
    var i = $('input', w);
    $$('button', w).forEach(function (b) { b.addEventListener('click', function () { i.value = Math.max(1, (+i.value || 1) + (+b.dataset.step)); recalcQty(); }); });
    i.addEventListener('input', recalcQty);
  });
  recalcQty();

  // kit totals
  $$('[data-kit]').forEach(function (k) {
    var calc = function () {
      var t = 0, n = 0;
      $$('input[type=checkbox]', k).forEach(function (c) { if (c.checked) { t += +c.dataset.price; n++; } });
      $$('[data-kit-total]', k).forEach(function (el) { el.textContent = money(t); });
      $$('[data-kit-count]', k).forEach(function (el) { el.textContent = n; });
    };
    $$('input[type=checkbox]', k).forEach(function (c) { c.addEventListener('change', calc); });
    calc();
  });

  // radio cards (checkout delivery)
  $$('[data-radio]').forEach(function (g) {
    $$('.radio', g).forEach(function (r) {
      r.addEventListener('click', function () {
        $$('.radio', g).forEach(function (x) { x.classList.remove('on'); });
        r.classList.add('on');
        var show = r.dataset.show;
        $$('[data-when]').forEach(function (el) { el.style.display = el.dataset.when === show ? '' : 'none'; });
        var fee = +r.dataset.fee || 0;
        $$('[data-fee]').forEach(function (el) { el.textContent = fee ? money(fee) : 'Free'; });
        $$('[data-grand]').forEach(function (el) { el.textContent = money((+el.dataset.base) + fee); });
      });
    });
  });

  // demo forms: never submit
  $$('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = $('.ok', f.parentNode) || $('.ok', f);
      if (ok) { ok.style.display = 'block'; }
      $$('input,textarea,button', f).forEach(function (x) { x.disabled = true; });
    });
  });
})();
