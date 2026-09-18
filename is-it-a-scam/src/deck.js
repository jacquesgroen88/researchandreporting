/* Deck navigation. One slide at a time on screen, every slide at once on paper.
   Keyboard, buttons, swipe and the URL hash all drive the same setter. */
(function () {
  'use strict';

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  var cur = document.getElementById('cur');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var printBtn = document.getElementById('printbtn');
  var index = 0;

  function show(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, n) {
      s.classList.toggle('is-current', n === index);
      s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
    });
    if (cur) cur.textContent = index + 1;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    if (history.replaceState) history.replaceState(null, '', '#' + slides[index].id);
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(index + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
    else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); window.print(); }
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { show(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { show(index + 1); });
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  var startX = null;
  document.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 55) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  function indexFromHash() {
    for (var i = 0; i < slides.length; i++) {
      if ('#' + slides[i].id === window.location.hash) return i;
    }
    return -1;
  }

  // Deep links have to work after load too, otherwise following a link to
  // #s12 from the already-open deck silently does nothing.
  window.addEventListener('hashchange', function () {
    var i = indexFromHash();
    if (i > -1 && i !== index) show(i);
  });

  var fromHash = indexFromHash();
  show(fromHash > -1 ? fromHash : 0);
}());
