/* save.html: open the phone's share sheet with the PDF so it can be saved to Files, Books, Drive, etc. */
(function () {
  'use strict';
  var PDF = 'Ali_Entezari_Resume.pdf';
  var btn = document.getElementById('save');
  var tip = document.getElementById('tip');
  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var file = null;

  // Fetch the PDF ahead of time: the share sheet must open directly from the tap,
  // so there is no time to download it after the button is pressed.
  if (navigator.canShare && window.File) {
    fetch(PDF).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
      if (!b) return;
      var f = new File([b], PDF, { type: 'application/pdf' });
      if (navigator.canShare({ files: [f] })) file = f;
    }).catch(function () { /* fall back to the plain download link */ });
  }

  if (isIOS) tip.innerHTML = 'Then choose <strong>Save to Files</strong> (or Books).';
  else if (isAndroid) tip.innerHTML = 'Then choose <strong>Drive</strong>, <strong>Files</strong> or any app you like.';

  btn.addEventListener('click', function (e) {
    if (!file) return; // let the normal download link work
    e.preventDefault();
    navigator.share({ files: [file], title: 'Ali Entezari, resume' }).catch(function (err) {
      if (err && err.name === 'AbortError') return; // closed the share sheet
      location.href = PDF;
    });
  });
})();
