/* Scam library: client-side search and category filtering.
   The full library is already in the HTML, so this only ever hides things.
   With JavaScript off, every scam is still there and still crawlable. */
(function () {
  'use strict';

  var input = document.getElementById('q');
  var count = document.getElementById('count');
  var empty = document.getElementById('empty');
  var grid = document.getElementById('library');
  if (!input || !grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var category = 'all';

  function apply() {
    var q = input.value.trim().toLowerCase();
    var terms = q ? q.split(/\s+/) : [];
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = card.dataset.search;
      var matchesText = terms.every(function (t) { return haystack.indexOf(t) !== -1; });
      var matchesCat = category === 'all' || card.dataset.category === category;
      var visible = matchesText && matchesCat;
      card.hidden = !visible;
      if (visible) shown++;
    });

    count.textContent = shown === cards.length
      ? cards.length + ' scams'
      : shown + ' of ' + cards.length + ' scams';
    empty.hidden = shown !== 0;
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(apply, 90);
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');
      category = chip.dataset.cat;
      apply();
    });
  });

  // Deep link support: /scams/?q=whatsapp lands pre-filtered.
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q');
  if (initial) {
    input.value = initial;
    apply();
  }
}());
