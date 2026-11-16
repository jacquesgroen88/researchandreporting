// The planner moved to https://projects.jcemedia.com/ (16 Nov 2026).
// This replaces the old offline worker: it clears its cache, removes itself,
// and sends any open planner tab to the new address.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: "window" })) c.navigate("https://projects.jcemedia.com/" + (new URL(c.url).hash || ""));
})()));
