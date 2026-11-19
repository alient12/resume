# Ali Entezari: resume site

Live at **https://alient12.github.io/resume/**

A static site with no build step. It runs on GitHub Pages straight from the `main` branch.

| Page | What it is |
| --- | --- |
| `index.html` | Interactive resume. Select a skill to highlight the experience and projects that use it. |
| `share.html` | Full-screen QR codes for meeting people in person: **Resume PDF** and **Reminder**. Swipe or tap the tabs to switch. |
| `save.html` | Where the resume QR lands: one button opens the phone's share sheet to save the PDF (Save to Files, Books, Drive). |
| `remind.html` | Where the reminder QR's link mode lands: buttons for Apple/Outlook (.ics) and Google Calendar. |
| `Ali_Entezari_Resume.pdf` | The PDF that the resume QR code opens. |

## Using the QR codes on your phone

1. Open `https://alient12.github.io/resume/share.html` on your phone.
2. Add it to your home screen (Safari: Share > Add to Home Screen; Chrome: menu > Add to Home screen). It opens full screen, straight to the codes.
3. **Resume PDF** tab: they scan it and get a page with a big *Save resume to my phone* button that opens their phone's share sheet (Save to Files, Books, Drive). Safari only displays PDFs, so this makes saving one tap.
4. **Reminder** tab: they scan it and their camera offers to add a calendar event for 10:00, two days later, with your resume link and email. Under *Reminder options* you can type where you met, and it gets added to the event.
   If someone's camera doesn't offer "Add to calendar", tick *Use a link instead*. The code then opens `remind.html`, which has Apple/Outlook and Google Calendar buttons.

The reminder date is worked out when the code is shown (direct mode) or when the link is opened (link mode), so it's always two days from that moment.

## Updating

- **New PDF:** replace `Ali_Entezari_Resume.pdf`, keeping the same file name, so the save page and QR codes keep working.
- **Content:** edit `index.html`. Each experience or project item has a `data-skills="..."` list that controls which skill chips light it up. The numbers on the chips are counted automatically.
- **Reminder text, time or delay:** see the constants at the top of `assets/common.js`.

QR codes are generated in the browser with [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT), included as `assets/qrcode.js`.
