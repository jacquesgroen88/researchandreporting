// Minimal service worker. Its only job is to make the card installable to the
// home screen; it deliberately does NOT cache the app shell, so a redeploy is
// always picked up fresh (no stale-build traps). Requests pass straight through.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // No respondWith: the browser handles every request normally (network).
})
