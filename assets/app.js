/* Skill filter ("triggers") and QR codes on the main page. */
(function () {
  'use strict';

  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.ev'));
  var hint = document.getElementById('filter-hint');
  var clearBtn = document.getElementById('clear-filter');
  var emptyNote = document.getElementById('empty-note');
  var active = null;

  function skillsOf(el) {
    return (el.getAttribute('data-skills') || '').split(',').map(function (s) { return s.trim(); });
  }

  // Count where each skill appears and show it on the chip.
  chips.forEach(function (chip) {
    var s = chip.getAttribute('data-skill');
    var n = items.filter(function (it) { return skillsOf(it).indexOf(s) !== -1; }).length;
    chip.setAttribute('aria-pressed', 'false');
    if (n) {
      var b = document.createElement('span');
      b.className = 'count';
      b.textContent = n;
      b.setAttribute('aria-label', n + (n === 1 ? ' item' : ' items'));
      chip.appendChild(b);
    } else {
      chip.classList.add('quiet');
    }
    chip.addEventListener('click', function () { select(active === s ? null : s); });
  });

  clearBtn.addEventListener('click', function () { select(null); });

  function select(skill) {
    active = skill;
    document.body.classList.toggle('filtering', !!skill);
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.getAttribute('data-skill') === skill));
    });
    var hits = 0, first = null;
    items.forEach(function (it) {
      var on = !!skill && skillsOf(it).indexOf(skill) !== -1;
      it.classList.remove('fired');
      if (on) {
        void it.offsetWidth; // restart the pulse
        it.classList.add('fired');
        hits++;
        if (!first) first = it;
      }
    });
    clearBtn.hidden = !skill;
    emptyNote.hidden = !(skill && hits === 0);
    if (!skill) {
      hint.textContent = "Select a skill to see where I've used it.";
    } else if (hits) {
      hint.textContent = skill + ': ' + hits + (hits === 1 ? ' match' : ' matches') + ' highlighted.';
    } else {
      hint.textContent = skill + ': part of my toolkit, not tied to an item on this page.';
    }
    // Bring the first match into view if it is off screen.
    var r = first && first.getBoundingClientRect();
    if (first && (r.top < 0 || r.bottom > window.innerHeight)) {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      first.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && active) select(null);
  });

  // QR codes in "Take this with you". The reminder uses the link version so the date
  // is worked out when someone scans it, even if this tab has been open for days.
  Resume.renderQr(document.getElementById('qr-pdf'), Resume.savePageUrl(), 'M');
  Resume.renderQr(document.getElementById('qr-remind'), Resume.remindPageUrl(), 'M');
})();
