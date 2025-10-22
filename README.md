
# Clock App (Alarm • Timer • Stopwatch • Widgets)

This is a single-page static web app that provides:
- Local clock (digital)
- Alarms (stored in localStorage; they fire while the page is open)
- Timer (countdown)
- Stopwatch (with lap)
- Simple embeddable widget snippet

## How to use
1. Open `index.html` in a browser (Chrome, Edge, Firefox, Safari).
2. Allow notifications if you want desktop notifications for alarms/timers.
3. Note: Alarms only reliably fire while this page/tab is open. Background alarms require a push service + service worker.

## Deploying to GitHub Pages
1. Create a new GitHub repo.
2. Copy these files into the repo root and push.
3. In the repo settings, enable GitHub Pages from the `main` branch (root).
4. Visit `https://<your-username>.github.io/<repo-name>/` to test.

## Limitations & Notes
- Browser security prevents alarms from waking the browser when the tab is closed without push notifications.
- If you need background alarms, implement a server push + service worker (Push API) or use a hosted cron to send pushes.
- This app is intentionally minimal and dependency-free.

