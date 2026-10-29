# Bar Study Pomodoro

A simple two-page Pomodoro timer for bar-exam preparation. It uses plain HTML, CSS, and JavaScript, so it can be hosted on GitHub Pages without a build step.

## Files
- `index.html` — timer page with 25-minute, 50-minute, and custom-duration options
- `history.html` — daily study log, totals, weekly minutes, and CSV export
- `style.css` — shared responsive styling
- `app.js` — countdown timer and session recording
- `history.js` — study history rendering and export

## Publish on GitHub Pages
1. Upload all five files into the same repository folder (usually the repository root).
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select your main branch and `/ (root)`, then save.
4. Open the published site. `index.html` is the home page; use **Study history** in the navigation to open the second page.

## How the tracker works
- Choose 25 minutes, 50 minutes, or enter a custom duration (1–600 minutes).
- Press **Start focus**. Pause and resume are supported; **Reset** starts the selected duration over.
- A session is recorded when the countdown reaches zero.
- The history page groups completed sessions by day and shows all-time and current-week totals.
- Use **Export CSV** to save a spreadsheet-friendly copy of the log.

## Important storage note
Study history is saved in the browser's `localStorage` on the device/browser you use. It is not synced between devices and may be lost if you clear browser data. For best results, use the same browser and device each day. The timer does not record partially completed sessions.
