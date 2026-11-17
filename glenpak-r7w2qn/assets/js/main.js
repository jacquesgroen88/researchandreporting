/* Glenpak shared behaviour (CORE). Vanilla, no dependencies, works from file://.
   - html.js class, footer year
   - header scroll shadow
   - mega menus (click + hover intent, Esc, outside click, focus leaving)
   - mobile off-canvas nav (focus trap, Esc, scroll lock)
   - finder: client-side search over SEARCH_INDEX
   - WhatsApp helper for [data-wa]
   - sticky contact bar hides while typing on mobile
*/
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, body = doc.body;
  root.classList.add('js');
  var ROOT = (body && body.getAttribute('data-root')) || '';
  var WA_NUMBERS = { jayson: '27790974115', charlene: '27712229146' };

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function waLink(msg, who) { return 'https://wa.me/' + (WA_NUMBERS[who] || WA_NUMBERS.jayson) + '?text=' + encodeURIComponent(msg); }

  /* ---------- year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- WhatsApp helper ---------- */
  $$('[data-wa]').forEach(function (el) {
    var msg = el.getAttribute('data-wa');
    if (msg) el.setAttribute('href', waLink(msg, el.getAttribute('data-wa-to')));
  });

  /* ---------- header scroll shadow ---------- */
  var header = $('#site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mega menus ---------- */
  var nav = $('.main-nav');
  var triggers = nav ? $$('[data-mega]', nav) : [];
  var openTrigger = null, hoverTimer = null, leaveTimer = null;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function panelFor(t) { return doc.getElementById(t.getAttribute('data-mega')); }
  function closeMega(focusBack) {
    if (!openTrigger) return;
    var p = panelFor(openTrigger);
    if (p) p.hidden = true;
    openTrigger.setAttribute('aria-expanded', 'false');
    if (focusBack) openTrigger.focus();
    openTrigger = null;
  }
  function openMega(t) {
    if (openTrigger === t) return;
    closeMega(false);
    var p = panelFor(t);
    if (!p) return;
    p.hidden = false;
    t.setAttribute('aria-expanded', 'true');
    openTrigger = t;
  }
  triggers.forEach(function (t) {
    var p = panelFor(t);
    if (!p) return;
    t.setAttribute('role', 'button');
    t.setAttribute('aria-expanded', 'false');
    t.setAttribute('aria-controls', p.id);
    t.addEventListener('click', function (e) {
      e.preventDefault();
      clearTimeout(hoverTimer);
      if (openTrigger === t) closeMega(false); else openMega(t);
    });
    t.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); t.click(); }
      if (e.key === 'ArrowDown') {
        e.preventDefault(); openMega(t);
        var first = $('a', p); if (first) first.focus();
      }
    });
    if (finePointer) {
      var li = t.parentNode;
      li.addEventListener('mouseenter', function () {
        clearTimeout(leaveTimer); clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { openMega(t); }, openTrigger ? 0 : 150);
      });
      li.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
    }
  });
  if (nav && triggers.length) {
    if (finePointer) {
      nav.addEventListener('mouseleave', function () {
        clearTimeout(hoverTimer);
        leaveTimer = setTimeout(function () { closeMega(false); }, 220);
      });
      nav.addEventListener('mouseenter', function () { clearTimeout(leaveTimer); });
      // hovering a plain nav link closes an open panel
      $$('.main-nav__link:not([data-mega])', nav).forEach(function (a) {
        a.addEventListener('mouseenter', function () { clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { closeMega(false); }, 150); });
      });
    }
    doc.addEventListener('click', function (e) { if (openTrigger && !nav.contains(e.target)) closeMega(false); });
    nav.addEventListener('focusout', function (e) {
      if (openTrigger && e.relatedTarget && !nav.contains(e.relatedTarget)) closeMega(false);
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openTrigger) closeMega(true); });
  }

  /* ---------- mobile nav ---------- */
  var toggle = $('.nav-toggle'), mnav = $('#mobile-nav'), lastFocus = null;
  function focusables(ctx) {
    return $$('a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])', ctx)
      .filter(function (el) { return el.offsetParent !== null || el === doc.activeElement; });
  }
  function openNav() {
    if (!mnav) return;
    lastFocus = doc.activeElement;
    mnav.hidden = false;
    body.classList.add('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    var c = $('.mobile-nav__close', mnav); if (c) c.focus();
  }
  function closeNav() {
    if (!mnav || mnav.hidden) return;
    mnav.hidden = true;
    body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (toggle && mnav) {
    toggle.addEventListener('click', openNav);
    $$('[data-close-nav]', mnav).forEach(function (b) { b.addEventListener('click', closeNav); });
    mnav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeNav(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables($('.mobile-nav__panel', mnav));
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // in-page anchor links close the panel
    $$('a[href*="#"]', mnav).forEach(function (a) { a.addEventListener('click', function () { setTimeout(closeNav, 0); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) closeNav(); });
    $$('[data-open-search]').forEach(function (b) {
      b.addEventListener('click', function () { openNav(); var f = doc.getElementById('finder-mobile'); if (f) f.focus(); });
    });
  }

  /* ---------- finder ---------- */
  // [type, name, sku, price, url (from site root), keywords]  type: s = supply, m = machine, p = page
  /*SEARCH_INDEX:START*/
  var SEARCH_INDEX = [
    ["s","Bakery bag 300mm x 450mm, 30mic, pack of 1000","2012528045775","R1,384.20","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","1kg flat-bottom coffee pouch, matte black, 150 x 330 + 90, no zip, no valve, per 200 bags","2081907563346","R1,880.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Kraft flat-bottom stand-up pouch with metallic inner and zip (CP FB range)","","Price on request","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Doy bag 1000ml, 165 x 230 (+98mm), zip and hanging hole","2060651476133","R4.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Doy bag 500ml, 130 x 210 (+78mm), zip and hanging hole","2060876622285","R2.92","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Doy bag 250ml, 100 x 175 (+60mm), zip and hanging hole","2086572914127","R1.76","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Black kraft paper stand-up pouch with matte window, 230 x 330 (+50mm), MX-102-8, each","2076102387897","R7.52","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Black kraft paper stand-up pouch with matte window, 180 x 260 (+40mm), MX-102-6, each","2021658744830","R4.48","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Coffee bag 1000g, black, MOPP/VMPET/PE, 230 x 340 +50 gusset, zip (MX-027)","MX02721000G","R7.79","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Coffee bag 500g, black, MOPP/VMPET/PE, 180 x 290 +50 gusset, zip (MX-027)","MX0272500G","R5.53","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Bakery bag 350mm x 400mm, 30mic, pack of 1000","2057101291095","R1,572.90","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Bakery bag 300mm x 300mm, 30mic, pack of 1000","2028258409411","R898.80","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Grape bags 312 x 166mm, zip, top header, base gusset, per 50","2040458089682","R465.70","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Vacuum bag, clear, food grade, 350 x 550mm, 70mic","2018800379057","R1,058.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Vacuum bag, clear, food grade, 350 x 400mm, 70mic","2089243421016","R3,290.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Greaseproof paper bags GP1, 180 x 140mm, pack of 100","2088816204933","R40.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Greaseproof paper bags GP3, 240 x 190mm, pack of 100","2034271646955 gp3","R48.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Bag neck sealer DZ-88 (tape bag closer)","2027774470295","R385.00","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["s","Egg tray 2 x 6, flip and split type, sold each, minimum 120","2078378408603","R2.36","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","5 dozen egg tray carrier (30 x 2) with handles, unprinted","2089239812873","R6.15","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg box outer, 15 dozen (180 eggs), unprinted","2010188684396","R14.87","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 30s, new production, bulk order minimum 10,000","2026763826402","R1.52","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 30s, new production, bulk order minimum 80,000","2026763826402","R1.38","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 18s, new production, minimum 200","2055825520781","R1.54","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 2 x 6, heat pressed, minimum 120","2044821211427","R2.36","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 2 x 6, bulk price, minimum 5,000","2069198881875","R2.28","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg trays 1 x 6, split pack, heat pressed, minimum 240","2050339637826","R1.15","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg box outer, 30 dozen (360 eggs), unprinted, 620 x 315 x 360","2025881133119","R20.73","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg box outer, 5 dozen carry pack, 1 colour printed to your design","2071580196979","R6.25","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Egg box outer, 5 dozen carry pack, 2 colour printed to your design","2066042175944","R6.55","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["s","Quality sorted used cardboard boxes, sold per kg","78695509732","R15.85 per kg","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Quality mixed used cardboard boxes, sold per kg","2078695509731","R12.85 per kg","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Hanger box TVL 9 for clothing and tall items, 500 x 400 x 655mm, single wall","2014967192621","R46.24","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Pizza box, brown, small 8 inch, 200 x 200 x 40mm","20747374910261","R2.89","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Used box, stock 6 to 7 equivalent, about 600 x 400 x 400, single wall","2047267343868","R18.85","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Used box, stock 6 to 7 equivalent, about 600 x 400 x 400, double wall","2081422794201","R21.00","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Used box, stock 5 to 6 equivalent, about 500 x 400 x 300, single wall","2065487047847","R14.85","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Used box, stock 3 to 4 equivalent, about 250 x 200 x 250, single wall","2054336739026","R5.87","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Bin box 380 x 100 x 110mm","2068202069520","R4.50","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Bin box 470 x 155 x 120mm","2010785290839","R7.00","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","Shoe box / gift box 325 x 220 x 120mm, black","2059452009398","R14.85","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["s","White newsprint sheets (fish wrap), 14kg, 1020 x 700/800mm","2064474485877","R315.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","White moving paper sheets (newsprint), 10kg, 1020 x 350/410mm","2068600091178","R225.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Greaseproof kitchen roll 330mm x 125m","2057742876903","R245.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Masking paper roll, brown, 900 to 950mm","2063410614302","R780.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","SFK corrugated board roll, 20kg, 900 to 915mm x about 70m","2016792708688","R575.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Pallet divider sheets 1000 x 1000, 350gsm B-flute SFK","2086720205695","R7.88","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Kraft bread bag, 6 roll (GPAK)","2048820396666","R0.59","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Kraft bread bag, 12 roll (GPAK)","2098451902224","R0.73","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Kraft roll for Paper EZ pad filler machine, 760mm, 70gsm, 350m","","R950.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Kraft Z-fold for Paper EZ Smart-Fill pad filler, 70gsm","2088387629418","R1,150.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Kraft Z-fold for Paper EZ Smart-Fill pad filler, 50gsm","2066827664830","R1,150.00","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["s","Clear box tape, pack of 6, 48mm x 100m","2085503735619","R238.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Printed tape \"Fragile, handle with care\", 48mm x 50m, red on white, each","2026415070719","R36.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Gum tape 72mm x 135m, per roll","2053390778378","R78.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Box tape dispenser for 48 to 50mm tape (50m and 100m rolls)","2081622873737","R165.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Label \"Fragile, handle with care\", large 102 x 150mm, per 250","2052997762629","R360.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Barrier tape 72mm x 500m, yellow and black","2067207814395YB","R98.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Barrier tape 72mm x 500m, red and white","2067207814395RW","R78.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Twist ties, black, 800m mega roll","2061981320844","R525.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Twist ties, white, 800m mega roll","2061981320844","R685.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Masking tape 48mm x 40m, per roll","","R48.00","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Masking tape 24mm x 40m, per roll","","R19.50","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["s","Combination strapping tool and tensioner P99/P160 for 12 to 13mm PET/PP","2062020919333","R2,850.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Plastic strapping tensioner, manual, 13 to 19mm","2027541771389","R1,850.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Steel strapping dispenser 16mm with wheels","2062885576115","R4,850.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Corner protector, plastic, 19mm width, 30mm sides","2060538830904","R385.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Fruit and veg netting 500mm x 1000m, green","2089841089649","R440.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","PP strapping for fully auto machines, white, 9mm x 4000m","2025860292196","R585.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","PP strapping for fully auto machines, white, 12mm x 3000m","2095508787353","R579.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","PP hand strapping, white, 12mm x 1000m","2021558307036","R225.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Corner protector, plastic, 32mm width, 30mm sides","2082303942971","R530.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Steel strapping tensioner 19 to 32mm, heavy duty","2042819093178","R4,785.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","PET/PP strapping dispenser 13 to 32mm","2046959833717","R3,850.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Pallet divider sheets 1000 x 1000, 350gsm B-flute SFK","2086720205695","R7.88","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Machine pallet wrap 450mm, 23mic, clear","2034735646682","R718.00","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["s","Cellophane gift wrap, 1m wide x 100m roll","2070320602206","R498.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Clear tape, pack of 6, 48mm x 100m","2085503735619","R238.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Christmas gift wrap, 500mm x 100m","2092359669647","R544.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift wrap, pure colour, 500mm wide, 50m and 100m","","R480.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift wrap kraft animal print (black on brown), 500mm x 100m","2073960020713","R930.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift wrap baby shower and party (yellow and orange), 500mm x 50m","2037974111232","R494.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift wrap party colour dot, 500mm x 50m","2022913693177","R494.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift box, super-rule photo box, 230 x 200 x 55mm, open top self lock","2056601830148","R5.80","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Gift box, cup box, 140 x 120 x 90mm, open top self lock","2029099641923","R45.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Shoe box / gift box 325 x 220 x 120mm, red","2038083269708","R14.85","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Shredded tissue, gold, 50g","2017802120995","R72.00","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["s","Corro-Shred small bale, 15 to 20kg, shredded corrugated void fill","2038277748354","R325.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Corro-Shred padding wool, recycled paper (listed as 100% biodegradable)","2047710163708","R225.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Bubble wrap 300mm x 100m","2016277138412","R160.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Dunnage bag, inflatable container void filler, 1000 x 1600mm","2052687615198","R188.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Bubble wrap 1220mm x 100m","2099405848667","R398.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Aerothene foam roll 1250mm x 100m, 3mm","2062745476135","R920.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Aerothene foam roll 1250mm x 100m, 2mm","2059664765167","R680.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Shredded bond paper bale, small, about 25kg","2017130241003","R385.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Shredded newsprint bale, small, about 25kg, unprinted","2098012603294","R385.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Handy Foam #100 expanding foam bag, about 580 x 650 x 150 expanded","2035161869782","R98.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Handy Foam #80 expanding foam bag, about 530 x 620 x 150 expanded","2013132442325","R80.00","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["s","Water bottle 1000ml, clear, CSD design, packed 216, sold per bottle","2018709591994","R4.85","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Water bottle 500ml, clear, CSD design, packed 345, sold per bottle","2021287435048","R3.15","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Cap 28mm flat, white, for water bottles","2018912860290","R0.47","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Juice bottle 3 litre, packed 60, sold per bottle","2057783763569","R7.35","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Juice bottle 1.5 litre, packed 143, sold per bottle","2091568944538","R6.20","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Juice bottle 1 litre, packed 168, sold per bottle","2072836988003","R4.94","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Juice bottle 500ml, packed 284, sold per bottle","2062946413595","R3.70","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Honey bottle 500ml (takes 28mm honey lid), packed 348, sold per bottle","2012952585021","R3.05","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Honey bottle 300ml (takes 38mm honey lid), packed 156, sold per bottle","2094417391286","R2.75","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Honey lid 38mm, yellow, for 300ml honey bottle","2048333652310","R1.30","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Honey lid 28mm, yellow","20196508375","Price on request","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Tampa neck seal 55mm lay flat, clear, fits 85 to 105mm circumference, 80mm high","2099018255043","R395.00","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Tampa neck seal 55mm lay flat, red / green / yellow (same spec)","2045972755372 / 2016833209686 / 2099818922237","R395.00","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Tampa neck seal 45mm lay flat, yellow, fits 55 to 89mm circumference, 80mm high","2073745800561","R395.00","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","PVC shrink tubing 260mm, 30mic","2040982682205","R1,987.00","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["s","Moving boxes, 1 bedroom house, new","2027658211983","R1,040.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Second-hand moving boxes, medium mixed (sizes 5, 6, 7), bundle of 20 to 30","2048610170759","R345.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Hanger box TVL 9 for clothing, 500 x 400 x 655mm","2014967192621","R46.24","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Bubble wrap 300mm x 100m","2016277138412","R160.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 1 bedroom home, new boxes","2027658211983","R1,040.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 1 bedroom home, used eco range","2057007880898","R1,150.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 2 bedroom home, new boxes","2046977159134","R2,277.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 2 bedroom home, used eco range","2043484501135","R1,850.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 3 bedroom home, new boxes","2060044571704","R3,579.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 3 bedroom home, used eco range","2067539654553","R2,950.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 4 bedroom home, new boxes","2095176148661","R4,477.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Moving kit, 4 bedroom home, used eco range","2077946408038","R3,850.00","products/moving.html#kits","moving boxes kit kits removal mattress cover bundle"],
    ["s","Second-hand moving boxes, X-small (sizes 1 to 4), bundle","2071038566774","R198.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Second-hand moving boxes, small (sizes 4, 5), bundle","2023941674862","R225.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Second-hand moving boxes, large (sizes 6, 7, 8), bundle","2030882965843","R425.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Mattress cover bag, base + queen, blue, 45mic","2040573531288","R105.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Mattress cover bag, base + king, red, 45mic","2046016352991","R98.00","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["s","Egg selling business start-up kit (500 trays, POF shrink roll, SKA 450 wrapper, heat gun)","","R9,850","machines/turnkey-lines.html#egg","egg kit start-up turnkey"],
    ["m","Bottle filling machine 3 in 1, CGF series, water, 2500 bph (XGDF8 CGF8)","","R585,000","machines/filling-and-bottling.html","wash fill cap water bottling bottle filling water plant"],
    ["m","Automatic tube filling and sealing machine FWJ-60A","","R680,000","machines/filling-and-bottling.html","tube filler sealer cream"],
    ["m","Automatic capping machine YQZ-1, screw-on plastic caps","","R189,500","machines/filling-and-bottling.html","capper capping cap"],
    ["m","Semi-auto bottle cap screw machine DDX-450, cap size 10 to 50mm","","R14,850","machines/filling-and-bottling.html","capper capping cap screw"],
    ["m","Bottle dryer, inline","","R168,000","machines/filling-and-bottling.html","drier dryer bottle"],
    ["m","Automatic powder filler 5g to 5000g, tube and conveyor TWF-C","","R235,000","machines/filling-and-bottling.html","powder filler auger spice"],
    ["m","Automatic powder filler 1g to 100g, small TWSF","","R98,000","machines/filling-and-bottling.html","powder filler small"],
    ["m","Magnetic gear filler, double head, digi-set YL-2","","R22,000","machines/filling-and-bottling.html","liquid filler gear pump"],
    ["m","Production line BF2000 (wash, fill, cap)","","R350,000","machines/filling-and-bottling.html","water bottling bf2000 water plant"],
    ["m","BF2000A filling line for water or carbonated drinks","","R508,000","machines/filling-and-bottling.html","water bottling bf2000a carbonated"],
    ["m","Carbonated drink filling and capping BF2000B","","R775,000","machines/filling-and-bottling.html","carbonated soda bf2000b bottling"],
    ["m","MR8-230F doy pouch loader, filler and sealer","","R774,000","machines/mr8-230f-doy-pouch-machine.html","doy pouch rotary premade bag filler"],
    ["m","Automatic granule packaging machine DXDK-40","","R160,000","machines/pouch-and-form-fill-seal.html","granule sachet vffs ffs"],
    ["m","Form fill and seal 1g to 100g, granular or powder, FZL 100 P","","R60,900","machines/pouch-and-form-fill-seal.html","ffs sachet powder granule"],
    ["m","Form fill and seal for paste 5ml to 40ml, MY-60Y","","R168,000","machines/pouch-and-form-fill-seal.html","ffs paste sauce sachet"],
    ["m","AS1000 automatic liquid packaging machine (lolly machine)","","R69,000","machines/lolly-turnkey-kit.html","lolly lollie lollies ice pop liquid sachet as1000"],
    ["m","Vertical packaging machine, bag width 100 to 350mm, film 720mm","","R486,400","machines/pouch-and-form-fill-seal.html","vffs vertical bagger"],
    ["m","Vertical packaging machine, bag width 180 to 400mm, film 820mm","","R656,640","machines/pouch-and-form-fill-seal.html","vffs vertical bagger"],
    ["m","Vertical packaging machine, bag width 350 to 500mm, film 1020mm","","R933,888","machines/pouch-and-form-fill-seal.html","vffs vertical bagger"],
    ["m","Form fill and seal granular 1kg to 5kg, HTX 520","","R335,000","machines/pouch-and-form-fill-seal.html","ffs granule rice sugar"],
    ["m","Form fill and seal granular 5kg to 10kg, HTX 620","","R475,000","machines/pouch-and-form-fill-seal.html","ffs granule rice sugar"],
    ["m","L-sealer and shrink tunnel combo DQL5545S + DSD4520","","R180,000","machines/l-sealer-shrink-tunnel-combos.html","shrink l sealer l-sealer tunnel combo"],
    ["m","L-sealer and shrink tunnel combo DQL5545VG + DSE5030TL, servo, high speed","","R267,520","machines/l-sealer-shrink-tunnel-combos.html","shrink l sealer l-sealer tunnel combo servo"],
    ["m","L-sealer and shrink tunnel combo DQL5545D + DSD4520/25, eco range","","R135,000","machines/l-sealer-shrink-tunnel-combos.html","shrink l sealer l-sealer tunnel combo eco"],
    ["m","Automatic sleeve wrapper QSJ5040A + BSE6040 tunnel + compressor","","R348,000","machines/shrink-wrapping.html","shrink sleeve wrapper tunnel"],
    ["m","Automatic side sealer, L-type, DQL4518S","","R236,800","machines/shrink-wrapping.html","shrink side sealer"],
    ["m","High speed automatic L-sealer DQL5545PEG, for shoe cases","","R233,475","machines/shrink-wrapping.html","shrink l sealer shoe"],
    ["m","L-sealer FQL380, sealing size 35 x 50cm","","R8,000","machines/shrink-wrapping.html","shrink l sealer l-sealer manual"],
    ["m","Shrink gun, gas model, pallet and machine wrapping","","R26,500","machines/shrink-wrapping.html","shrink gun gas pallet heat"],
    ["m","Heat shrink electric hand gun 1600W to 2000W","","R985","machines/shrink-wrapping.html","heat gun shrink tampa hot air"],
    ["m","Door and window sleeve wrapper + tunnel, pack 1200 x 250mm","","R1,055,000","machines/shrink-wrapping.html","sleeve wrapper door window"],
    ["m","Door and window sleeve wrapper + tunnel, pack 1500 x 500mm","","R1,150,000","machines/shrink-wrapping.html","sleeve wrapper door window"],
    ["m","Side sealer DQL6025G + DSE6030A tunnel","","R350,200","machines/shrink-wrapping.html","shrink side sealer tunnel"],
    ["m","KIS-900 rotary cup filling and sealing machine","","R236,800","machines/kis-900-cup-filler-sealer.html","cup filler sealer yoghurt jelly kis900"],
    ["m","CFD-4 automatic cup filling and sealing machine","","R340,000","machines/sealers.html","cup filler sealer"],
    ["m","QZD95 automatic cup sealing machine","","R38,300","machines/sealers.html","cup sealer"],
    ["m","CFS-2000 heavy-duty automatic cup sealer","","R225,000","machines/sealers.html","cup sealer"],
    ["m","Bag neck sealer DZ-88 (tape bag closer)","","R385","machines/sealers.html","bag neck sealer closer bread"],
    ["m","Automatic rotary cup fill and seal, 1500 per hour","","R155,000","machines/sealers.html","cup filler sealer rotary"],
    ["m","Automatic rotary cup fill and seal, 2 cup, 2500 per hour","","R235,000","machines/sealers.html","cup filler sealer rotary"],
    ["m","Vacuum packaging machine DZ600GP-2SD, double chamber, gas flush, stainless","","R72,000","machines/sealers.html","vacuum packer sealer"],
    ["m","External vacuum sealer DZ600T","","R28,000","machines/sealers.html","vacuum packer sealer"],
    ["m","Vacuum packaging machine DZ400GP-2D, gas flush","","R24,000","machines/sealers.html","vacuum packer sealer"],
    ["m","Vacuum packaging machine DZQ500GP-2T, gas flush","","R22,000","machines/sealers.html","vacuum packer sealer"],
    ["m","Band sealer, vertical, QLF-1680","","R48,155","machines/sealers.html","band sealer continuous"],
    ["m","Band sealer QLF 1680 + L, extra height","","R68,000","machines/sealers.html","band sealer continuous"],
    ["m","Foot impulse sealer PSF 1200D, industrial","","R19,250","machines/sealers.html","impulse sealer foot heat sealer"],
    ["m","Automatic carton packing line: auto fold, H-tape and auto strapping","","R565,000","machines/carton-packing-line.html","carton line box erector sealer strapping end of line"],
    ["m","Automatic carton sealer, auto fold, FXJ4030ZX","","R68,100","machines/carton-and-end-of-line.html","carton sealer box taper"],
    ["m","Carton sealer FXC5050GP with side conveyors","","R37,209.60","machines/carton-and-end-of-line.html","carton sealer box taper"],
    ["m","Fully auto strapping machine ET80 GPA, manual loading, arch 850 x 600","","R62,000","machines/carton-and-end-of-line.html","strap strapping machine"],
    ["m","Battery hand strapping tool 16 to 19mm PET/PP, ET3000-1619-GP","","R32,000","machines/carton-and-end-of-line.html","strap strapping battery tool"],
    ["m","KY-CO3 sack stitcher and closer with 3.3m conveyor","","R98,000","machines/ky-co3-sack-stitcher.html","sack stitcher bag closer sewing"],
    ["m","Box erector and bottom sealer DKX-4540","","R215,000","machines/carton-and-end-of-line.html","carton erector box"],
    ["m","Box erector and bottom sealer DKX-4540s","","R225,000","machines/carton-and-end-of-line.html","carton erector box"],
    ["m","Side carton box sealer DQFXC5045X","","R68,000","machines/carton-and-end-of-line.html","carton sealer side"],
    ["m","Gum taper, inline, semi-auto, water activated","","R335,000","machines/carton-and-end-of-line.html","gum tape taper"],
    ["m","Orbital pallet wrapper 1200mm","","R295,000","machines/carton-and-end-of-line.html","pallet wrap wrapper orbital stretch"],
    ["m","Orbital pallet wrapper 1500mm","","R345,000","machines/carton-and-end-of-line.html","pallet wrap wrapper orbital stretch"],
    ["m","Orbital pallet wrapper 2000mm","","R525,000","machines/carton-and-end-of-line.html","pallet wrap wrapper orbital stretch"],
    ["m","Orbital wrapper S800, 800mm","","R387,000","machines/carton-and-end-of-line.html","pallet wrap wrapper orbital"],
    ["m","Automatic pallet wrapping machine TP1650F, pre-stretch","","R131,500","machines/carton-and-end-of-line.html","pallet wrap wrapper stretch"],
    ["m","Automatic double-sided labelling applicator AR-60","","R488,000","machines/coding-and-labelling.html","label labeller labeler applicator"],
    ["m","Inline combo printer A09/DY360c, 2 in 1","","R16,850","machines/coding-and-labelling.html","coder printer date coding"],
    ["m","Desktop electric pad printer TDY-300C, prints on plastic and metal","","R8,450","machines/coding-and-labelling.html","pad printer printing"],
    ["m","Automatic paper folding machine ZE-9B/2","","R28,500","machines/coding-and-labelling.html","paper folding"],
    ["m","Automatic single-side labeller AR-50","","R198,000","machines/coding-and-labelling.html","label labeller labeler"],
    ["m","Fully auto label applicator MT-130, eco range","","R98,000","machines/coding-and-labelling.html","label labeller labeler"],
    ["m","Flat labeller with coding MT-60C","","R46,000","machines/coding-and-labelling.html","label labeller labeler flat coding"],
    ["m","Flat labeller MT-60","","R38,835","machines/coding-and-labelling.html","label labeller labeler flat"],
    ["m","Round bottle labeller with coding MT-50C","","R31,500","machines/coding-and-labelling.html","label labeller labeler round bottle"],
    ["m","Inline inkjet printer with stand","","R29,850","machines/coding-and-labelling.html","inkjet coder date printer batch"],
    ["m","BF2000 water bottling lines A, B and C, 1500 to 2000 bottles per hour","","From R538,000","machines/bf2000-water-bottling-lines.html","water bottling water plant bf2000 turnkey line start-up"],
    ["m","Lolly business turnkey kit (AS1000 machine, lolly plastic, flavour starters)","","R74,000","machines/lolly-turnkey-kit.html","lolly lollie lollies ice pop turnkey start-up kit"],
    ["m","KY-CO3 sack stitcher + conveyor + weigher + bucket loader","","R102,900","machines/ky-co3-sack-stitcher.html","sack stitcher weigher bucket loader"],
    ["m","Water bottling MONO 3 in 1, 4000 bph (LINE MONO D)","","Price on request","machines/turnkey-lines.html","water bottling mono turnkey"],
    ["p","Home","","","index.html","home glenpak"],
    ["p","Packaging supplies","","","products/index.html","supplies consumables shop all products"],
    ["p","Bags and pouches","","","products/bags-and-pouches.html","bag bags pouch pouches doy stand-up standup coffee bakery bread vacuum greaseproof zip"],
    ["p","Egg trays and egg packaging","","","products/egg-and-poultry.html","egg tray trays egg box egg carton outer carrier poultry dozen"],
    ["p","Corrugated boxes","","","products/corrugated-boxes.html","corro corrugated box boxes carton cardboard used pizza bin hanger"],
    ["p","Kraft, newsprint and paper","","","products/kraft-and-paper.html","kraft paper newsprint fish wrap greaseproof masking sfk board"],
    ["p","Tapes, labels and tags","","","products/tapes-and-labels.html","tape tapes label labels fragile gum twist ties dispenser barrier masking"],
    ["p","Strapping and pallet supplies","","","products/strapping-and-pallet.html","strap strapping pallet pp pet tensioner corner protector netting wrap"],
    ["p","Gift packaging and wrapping paper","","","products/gift-packaging.html","gift wrap wrapping paper cellophane gift box tissue christmas"],
    ["p","Void fill and protective wrap","","","products/void-fill.html","void fill bubble wrap bubblewrap corro-shred corroshred foam dunnage shredded"],
    ["p","Plastic bottles, caps and tamper seals","","","products/bottles-and-shrink-seals.html","bottle bottles cap caps lid water juice honey tampa tamper neck seal shrink seal sleeve"],
    ["p","Moving boxes and moving kits","","","products/moving.html","moving boxes kit kits removal mattress cover bundle"],
    ["p","Packaging machines and production lines","","","machines/index.html","machines machinery equipment catalogue"],
    ["p","Filling, capping and bottling machines","","","machines/filling-and-bottling.html","filler filling capping capper bottling water plant bottle filling liquid powder"],
    ["p","Pouch and form fill seal machines","","","machines/pouch-and-form-fill-seal.html","pouch doy ffs form fill seal sachet vffs vertical granule powder"],
    ["p","Shrink wrapping machines","","","machines/shrink-wrapping.html","shrink l sealer l-sealer tunnel sleeve wrapper heat gun"],
    ["p","Sealers: cup, tray, band, vacuum and hand","","","machines/sealers.html","sealer cup tray band vacuum impulse heat sealer"],
    ["p","Carton sealing, strapping and pallet wrapping","","","machines/carton-and-end-of-line.html","carton sealer strapping strap pallet wrapper erector end of line"],
    ["p","Coding, printing and labelling machines","","","machines/coding-and-labelling.html","coding coder printer label labeller labeler inkjet"],
    ["p","Turnkey start-up lines","","","machines/turnkey-lines.html","turnkey start-up startup line business kit water plant lolly egg"],
    ["p","BF2000 water bottling lines","","","machines/bf2000-water-bottling-lines.html","water bottling water plant bf2000 bottle filling"],
    ["p","MR8-230F doy pouch machine","","","machines/mr8-230f-doy-pouch-machine.html","doy pouch mr8 rotary"],
    ["p","Automatic carton packing line","","","machines/carton-packing-line.html","carton line box erector"],
    ["p","L-sealer and shrink tunnel combos","","","machines/l-sealer-shrink-tunnel-combos.html","shrink l sealer l-sealer tunnel combo"],
    ["p","KY-CO3 sack stitcher","","","machines/ky-co3-sack-stitcher.html","sack stitcher closer"],
    ["p","Lolly business turnkey kit","","","machines/lolly-turnkey-kit.html","lolly lollie lollies ice pop"],
    ["p","KIS-900 cup filler and sealer","","","machines/kis-900-cup-filler-sealer.html","cup filler sealer kis"],
    ["p","Request a quote","","","quote.html","quote price pricing enquiry rfq"],
    ["p","About Glenpak","","","about.html","about family history bbbee"],
    ["p","Contact Glenpak","","","contact.html","contact phone whatsapp email address directions"],
    ["p","Paper reel splitting and printing","","","services.html","services reel splitting slitting printing flexo sheeting recovery"],
    ["p","Packaging calculators","","","calculators.html","calculator calculators bag weight roll paper box board"],
    ["p","Reuse, recycling and second-life packaging","","","sustainability.html","sustainability recycling reuse used eco green waste"]
  ];
  /*SEARCH_INDEX:END*/

  var TYPE_LABEL = { s: 'Supply', m: 'Machine', p: 'Page' };
  var PAGE_NAMES = {};
  SEARCH_INDEX.forEach(function (r) { if (r[0] === 'p') PAGE_NAMES[r[4]] = r[1]; });

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  var PREPARED = SEARCH_INDEX.map(function (r) {
    return { r: r, name: norm(r[1]).split(' '), sku: norm(r[2]).split(' '), kw: norm(r[5]).split(' '), full: norm(r[1]) };
  });
  function hasPrefix(words, tok) {
    for (var i = 0; i < words.length; i++) if (words[i] && words[i].indexOf(tok) === 0) return true;
    return false;
  }
  function search(q, scope) {
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length) return [];
    var nq = toks.join(' ');
    var res = [];
    PREPARED.forEach(function (it) {
      var r = it.r;
      if (scope === 'supplies' && !(r[0] === 's' || (r[0] === 'p' && r[4].indexOf('products/') === 0))) return;
      if (scope === 'machines' && !(r[0] === 'm' || (r[0] === 'p' && r[4].indexOf('machines/') === 0))) return;
      var score = 0;
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i];
        if (hasPrefix(it.name, t)) score += 4;
        else if (hasPrefix(it.sku, t)) score += 4;
        else if (hasPrefix(it.kw, t)) score += 1;
        else return;
      }
      if (it.full.indexOf(nq) === 0) score += 6;
      else if (it.full.indexOf(nq) > -1) score += 3;
      if (r[0] === 'p') score += 2;
      res.push({ it: it, score: score });
    });
    res.sort(function (a, b) { return b.score - a.score || a.it.r[1].length - b.it.r[1].length; });
    return res.slice(0, 8).map(function (x) { return x.it.r; });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function highlight(name, q) {
    var toks = norm(q).split(' ').filter(function (t) { return t.length > 1; });
    var out = esc(name);
    toks.forEach(function (t) {
      var re = new RegExp('(^|[^a-z0-9])(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '$1<mark>$2</mark>');
    });
    return out;
  }

  var finderCount = 0;
  $$('[data-finder]').forEach(function (box) {
    var input = $('.finder__input', box), list = $('.finder__results', box);
    if (!input || !list) return;
    finderCount++;
    if (!list.id) list.id = 'finder-results-' + finderCount;
    var scope = box.getAttribute('data-finder-scope') || '';
    var active = -1, items = [];
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', list.id);

    function close() {
      list.hidden = true; input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant'); active = -1;
    }
    function setActive(i) {
      items.forEach(function (li, n) {
        li.setAttribute('aria-selected', n === i ? 'true' : 'false');
        var a = li.firstChild; if (a && a.classList) a.classList.toggle('is-active', n === i);
      });
      active = i;
      if (i > -1 && items[i]) { input.setAttribute('aria-activedescendant', items[i].id); items[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function render() {
      var q = input.value;
      if (!norm(q)) { close(); list.innerHTML = ''; items = []; return; }
      var res = search(q, scope);
      var html = '';
      if (!res.length) {
        html = '<li class="finder__empty" role="option" aria-disabled="true">No match. <a href="' +
          esc(waLink('Hi Glenpak, I\'m looking for: ' + q.trim())) + '" target="_blank" rel="noopener">Ask us on WhatsApp</a></li>';
      } else {
        res.forEach(function (r, i) {
          var t = r[0], page = r[4].split('#')[0];
          var where = t === 'p' ? (r[4].indexOf('machines/') === 0 ? 'Machines' : r[4].indexOf('products/') === 0 ? 'Packaging supplies' : 'Glenpak') : (PAGE_NAMES[page] || '');
          if (t !== 'p' && r[2]) where += ' · SKU ' + r[2];
          var price = '';
          if (r[3]) price = /request/i.test(r[3]) ? '<span class="finder__price"><small>Price on request</small></span>'
            : '<span class="finder__price">' + esc(r[3]) + '<small>Excl VAT</small></span>';
          html += '<li role="option" id="' + list.id + '-o' + i + '" aria-selected="false">' +
            '<a class="finder__result" href="' + esc(ROOT + r[4]) + '" tabindex="-1">' +
            '<span class="finder__type finder__type--' + (t === 'm' ? 'machine' : t === 'p' ? 'page' : 'supply') + '">' + TYPE_LABEL[t] + '</span>' +
            '<span class="finder__name">' + highlight(r[1], q) + '</span>' + price +
            '<span class="finder__where">' + esc(where) + '</span></a></li>';
        });
      }
      list.innerHTML = html;
      items = $$('li[role="option"]:not([aria-disabled])', list);
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
      setActive(-1);
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { if (norm(input.value)) render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); if (items.length) setActive(Math.min(active + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) setActive(Math.max(active - 1, -1)); }
      else if (e.key === 'Enter') {
        var target = items[active > -1 ? active : 0];
        if (target && !list.hidden) { e.preventDefault(); window.location.href = target.firstChild.getAttribute('href'); }
      }
      else if (e.key === 'Escape') { if (!list.hidden) { e.preventDefault(); e.stopPropagation(); close(); } }
    });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); }); // keep focus while clicking a result
    doc.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    input.addEventListener('blur', function () { setTimeout(function () { if (!box.contains(doc.activeElement)) close(); }, 120); });
  });

  // [data-finder-focus] buttons focus a finder (e.g. "Search" shortcuts)
  $$('[data-finder-focus]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var target = doc.getElementById(b.getAttribute('data-finder-focus'));
      if (target) { e.preventDefault(); target.focus(); }
    });
  });

  /* ---------- sticky bar hides while typing (mobile keyboard) ---------- */
  var bar = $('.sticky-bar');
  if (bar) {
    doc.addEventListener('focusin', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && window.innerWidth < 960) bar.classList.add('is-hidden');
    });
    doc.addEventListener('focusout', function () { bar.classList.remove('is-hidden'); });
  }
})();
