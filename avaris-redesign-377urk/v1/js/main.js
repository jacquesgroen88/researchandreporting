/* ==========================================================================
   Avaris round 1: progressive enhancement only. No frameworks, no build.
   Every page works without this file; JS adds:
   1. Mobile menu (toggle, Esc to close, focus return)
   2. Header shadow on scroll
   3. aria-current on the nav link for the current page
   4. ?bag=<slug> pre-selects the bag on contact.html#quote (and the industry)
   5. Product filter chips on products.html
   6. Demo-only form handling with inline validation (COPY 0.6, 6.2)
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---------- 1. Mobile menu ---------- */
  var toggle = $("[data-nav-toggle]");
  var panel = $("[data-mobile-nav]");
  if (toggle && panel) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.hidden = !open;
      doc.body.classList.toggle("menu-open", open);
      if (open) {
        var first = $("a", panel);
        if (first) first.focus();
      }
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    $$("a", panel).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    var mq = window.matchMedia("(min-width: 1024px)");
    var onMq = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- 2. Header shadow on scroll ---------- */
  var header = $("[data-header]");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* ---------- 3. Current page in nav ---------- */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".site-nav__link, .mobile-nav__list a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("#")[0].split("?")[0].toLowerCase();
    if (href === page) a.setAttribute("aria-current", "page");
  });

  /* ---------- 4. ?bag= pre-select on the quote form ---------- */
  // Slugs: COPY.md 2.4. "other" maps to the "Not sure / other" option (value="other").
  var BAG_INDUSTRY = {
    "agriculture-bags": "agriculture", "animal-feed-bags": "agriculture", "farming-bags": "agriculture",
    "industrial-bags": "cleaning", "medical-hygiene-industry-bags": "cleaning", "cleaning-company-bags": "cleaning",
    "ice-bags": "food", "bakery-deli": "food",
    "shopping-bags": "retail", "general-packaging": "retail", "broadseal-bag": "retail",
    "courier-bags": "courier"
  };
  var bagSelect = $("[data-bag-select]");
  if (bagSelect) {
    var params = new URLSearchParams(location.search);
    var bag = (params.get("bag") || "").toLowerCase();
    if (bag && $('option[value="' + bag.replace(/[^a-z0-9-]/g, "") + '"]', bagSelect)) {
      bagSelect.value = bag;
      var industrySelect = $("[data-industry-select]");
      if (industrySelect && BAG_INDUSTRY[bag] && !industrySelect.value) industrySelect.value = BAG_INDUSTRY[bag];
      var hint = $("[data-bag-prefill]");
      if (hint) {
        hint.textContent = "We filled in " + bagSelect.options[bagSelect.selectedIndex].text + " for you. Change it if you need to.";
        hint.hidden = false;
      }
    }
  }

  /* ---------- 5. Product filter chips ---------- */
  var filterBar = $("[data-filter-bar]");
  if (filterBar) {
    var tiles = $$("[data-group]");
    var empty = $("[data-filter-empty]");
    var status = $("[data-filter-status]");
    filterBar.hidden = false;
    filterBar.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter]");
      if (!chip) return;
      var f = chip.getAttribute("data-filter");
      $$("[data-filter]", filterBar).forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      var shown = 0;
      tiles.forEach(function (t) {
        var match = f === "all" || t.getAttribute("data-group").split(" ").indexOf(f) !== -1;
        t.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = shown + (shown === 1 ? " bag shown" : " bags shown");
    });
  }

  /* ---------- 6. Demo-only forms ---------- */
  var MSG = {
    required: "Please fill in this field.",
    email: "Please enter a valid email address.",
    consent: "Please tick the box so we can reply to you."
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var fieldOf = function (el) { return el.closest(".field, .consent") || el.parentNode; };
  var errorOf = function (el) {
    var f = fieldOf(el);
    var err = $(".field__error", f);
    if (!err) {
      err = doc.createElement("p");
      err.className = "field__error";
      err.id = (el.id || el.name) + "-error";
      f.appendChild(err);
    }
    return err;
  };
  var validate = function (el) {
    var msg = "";
    if (el.type === "checkbox") {
      if (el.required && !el.checked) msg = MSG.consent;
    } else {
      var v = (el.value || "").trim();
      if (el.required && !v) msg = MSG.required;
      else if (el.type === "email" && v && !EMAIL_RE.test(v)) msg = MSG.email;
    }
    var f = fieldOf(el);
    var err = errorOf(el);
    err.textContent = msg;
    f.classList.toggle("is-invalid", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    var describedBy = (el.getAttribute("aria-describedby") || "").split(" ").filter(function (id) { return id && id !== err.id; });
    if (msg) describedBy.push(err.id);
    if (describedBy.length) el.setAttribute("aria-describedby", describedBy.join(" ")); else el.removeAttribute("aria-describedby");
    return !msg;
  };

  $$("form[data-demo-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    var controls = $$("[required], input[type=email]", form);
    controls.forEach(function (el) {
      el.addEventListener(el.type === "checkbox" ? "change" : "blur", function () {
        if (el.getAttribute("aria-invalid") === "true" || el.value) validate(el);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      controls.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });
      var note = $("[data-form-note]", form);
      if (firstBad) {
        if (note) note.classList.remove("is-shown");
        firstBad.focus();
        return;
      }
      if (note) {
        note.classList.add("is-shown");
        note.setAttribute("tabindex", "-1");
        note.focus();
      }
    });
  });
})();
