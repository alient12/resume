/* Shared helpers: site URL, QR rendering, calendar event building. */
(function () {
  'use strict';

  // Public address of the site. Used when the page is opened from a local file.
  var FALLBACK_BASE = 'https://alient12.github.io/resume/';
  var PDF_FILE = 'Ali_Entezari_Resume.pdf';
  var NAME = 'Ali Entezari';
  var EMAIL = 'ali_ent12@outlook.com';
  var REMIND_DAYS = 2;
  var REMIND_HOUR = 10; // 10:00 in the scanner's own time zone

  function siteBase() {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return location.origin + location.pathname.replace(/[^/]*$/, '');
    }
    return FALLBACK_BASE;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // Floating local time (no Z): the event lands at 10:00 wherever the scanner lives.
  function icsLocal(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function icsUtc(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function reminderTimes(from) {
    var start = new Date(from || Date.now());
    start.setDate(start.getDate() + REMIND_DAYS);
    start.setHours(REMIND_HOUR, 0, 0, 0);
    var end = new Date(start.getTime() + 30 * 60 * 1000);
    return { start: start, end: end };
  }

  // short: fewer characters, so the QR code has bigger squares and scans faster.
  function reminderText(where, short) {
    var base = siteBase();
    var title = 'Follow up with ' + NAME;
    var met = where ? 'You met ' + NAME + ' at ' + where + '.' : 'You met ' + NAME + ' two days ago.';
    var desc = short
      ? met + '\nResume: ' + base + '\nEmail: ' + EMAIL
      : met + '\nPython and applied AI developer, available from January 2027.' +
        '\nResume: ' + base + '\nPDF: ' + base + PDF_FILE + '\nEmail: ' + EMAIL;
    return { title: title, desc: desc, url: base };
  }

  // Compact VEVENT that phone cameras (iOS, Google Lens, most QR apps) offer to add to the calendar.
  function veventForQr(where) {
    var t = reminderTimes();
    var x = reminderText(where, true);
    return [
      'BEGIN:VEVENT',
      'SUMMARY:' + icsEscape(x.title),
      'DTSTART:' + icsLocal(t.start),
      'DTEND:' + icsLocal(t.end),
      'DESCRIPTION:' + icsEscape(x.desc),
      'URL:' + x.url,
      'END:VEVENT'
    ].join('\n');
  }

  // Full calendar file with an alarm, for the .ics download on remind.html.
  function icsFile(where) {
    var t = reminderTimes();
    var x = reminderText(where);
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ali Entezari//Resume reminder//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@alient12.github.io',
      'DTSTAMP:' + icsUtc(new Date()),
      'DTSTART:' + icsLocal(t.start),
      'DTEND:' + icsLocal(t.end),
      'SUMMARY:' + icsEscape(x.title),
      'DESCRIPTION:' + icsEscape(x.desc),
      'URL:' + x.url,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape(x.title),
      'TRIGGER:-PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n') + '\r\n';
  }

  function googleCalendarUrl(where) {
    var t = reminderTimes();
    var x = reminderText(where);
    var p = new URLSearchParams({
      action: 'TEMPLATE',
      text: x.title,
      dates: icsLocal(t.start) + '/' + icsLocal(t.end),
      details: x.desc
    });
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }

  function remindPageUrl(where) {
    var u = siteBase() + 'remind.html';
    return where ? u + '?met=' + encodeURIComponent(where) : u;
  }

  // Render text as an SVG QR code into el. ecc: L/M/Q/H.
  function renderQr(el, text, ecc) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    var qr = qrcode(0, ecc || 'M');
    qr.addData(text, 'Byte');
    qr.make();
    var n = qr.getModuleCount(), q = 4, size = n + q * 2, d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
      }
    }
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size +
      '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
    el.setAttribute('data-qr', text);
  }

  window.Resume = {
    siteBase: siteBase,
    pdfUrl: function () { return siteBase() + PDF_FILE; },
    veventForQr: veventForQr,
    icsFile: icsFile,
    googleCalendarUrl: googleCalendarUrl,
    remindPageUrl: remindPageUrl,
    reminderTimes: reminderTimes,
    renderQr: renderQr
  };
})();
