
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
3. Note: Alarms only reliably fire while this page/tab is open. As Background alarms require a push service + service worker.


## Limitations & Notes
- Browser security prevents alarms from waking the browser when the tab is closed without push notifications.
- This app is intentionally minimal and dependency-free.

