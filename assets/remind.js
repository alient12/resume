/* remind.html: builds a reminder for two days from the moment the page is opened. */
(function () {
  'use strict';
  var where = (new URLSearchParams(location.search).get('met') || '').slice(0, 60);
  var t = Resume.reminderTimes();
  document.getElementById('when').textContent = 'Reminder for ' +
    t.start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ', 10:00';
  if (where) document.getElementById('met-line').textContent = 'We met at ' + where + '. The reminder links back to my resume.';

  document.getElementById('gcal').href = Resume.googleCalendarUrl(where);

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  document.getElementById('ics').addEventListener('click', function (e) {
    e.preventDefault();
    var ics = Resume.icsFile(where);
    if (isIOS) {
      // Safari on iPhone hands a text/calendar page straight to the Calendar app.
      location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
      return;
    }
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Remember-Ali-Entezari.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    document.getElementById('done').textContent = 'Downloaded. Open the file to add it to your calendar.';
  });
})();
