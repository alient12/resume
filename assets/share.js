/* Full-screen QR page for sharing in person. */
(function () {
  'use strict';

  var qrEl = document.getElementById('qr');
  var tabPdf = document.getElementById('tab-pdf');
  var tabRemind = document.getElementById('tab-remind');
  var sayPdf = document.getElementById('say-pdf');
  var sayRemind = document.getElementById('say-remind');
  var opts = document.getElementById('opts');
  var met = document.getElementById('met');
  var linkMode = document.getElementById('linkmode');
  var whenNote = document.getElementById('when-note');
  var stage = document.getElementById('stage');

  function load(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  met.value = load('qr.met', '');
  linkMode.checked = load('qr.linkmode', '0') === '1';
  var current = location.hash === '#reminder' ? 'remind' : 'pdf';

  function show(which) {
    current = which;
    var isPdf = which === 'pdf';
    tabPdf.setAttribute('aria-selected', String(isPdf));
    tabRemind.setAttribute('aria-selected', String(!isPdf));
    sayPdf.hidden = !isPdf;
    sayRemind.hidden = isPdf;
    opts.hidden = isPdf;
    history.replaceState(null, '', isPdf ? '#resume' : '#reminder');

    if (isPdf) {
      Resume.renderQr(qrEl, Resume.savePageUrl(), 'M');
      qrEl.setAttribute('aria-label', 'QR code to save the PDF resume');
      return;
    }
    var where = met.value.trim();
    if (linkMode.checked) {
      Resume.renderQr(qrEl, Resume.remindPageUrl(where), 'M');
    } else {
      // The event text is dense, so use low error correction to keep modules large.
      Resume.renderQr(qrEl, Resume.veventForQr(where), 'L');
    }
    qrEl.setAttribute('aria-label', 'QR code that adds a reminder to the calendar');
    var t = Resume.reminderTimes();
    whenNote.textContent = 'If scanned now, the reminder lands on ' +
      t.start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' at 10:00.';
  }

  tabPdf.addEventListener('click', function () { show('pdf'); });
  tabRemind.addEventListener('click', function () { show('remind'); });

  // Arrow keys move between tabs.
  [tabPdf, tabRemind].forEach(function (t) {
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var next = current === 'pdf' ? 'remind' : 'pdf';
        show(next);
        (next === 'pdf' ? tabPdf : tabRemind).focus();
      }
    });
  });

  // Swipe sideways on the code to switch.
  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 60) show(dx < 0 ? 'remind' : 'pdf');
  }, { passive: true });

  var typing;
  met.addEventListener('input', function () {
    save('qr.met', met.value);
    clearTimeout(typing);
    typing = setTimeout(function () { show('remind'); }, 250);
  });
  linkMode.addEventListener('change', function () {
    save('qr.linkmode', linkMode.checked ? '1' : '0');
    show('remind');
  });

  // Recompute the date when the page comes back after being in the background,
  // so a page left open overnight still gives "two days from now".
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { show(current); requestWakeLock(); }
  });

  // Keep the screen on while showing a code.
  var lock = null;
  function requestWakeLock() {
    if (!('wakeLock' in navigator) || lock) return;
    navigator.wakeLock.request('screen').then(function (l) {
      lock = l;
      l.addEventListener('release', function () { lock = null; });
    }).catch(function () { /* not allowed here */ });
  }
  requestWakeLock();

  show(current);
})();
