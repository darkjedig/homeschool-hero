// Self-unregistering service worker.
// A previous localhost app may have registered a service worker that caches
// stale HTML. When the browser re-fetches this file, this SW unregisters
// itself (and any prior version) so it stops intercepting requests.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await self.registration.unregister();
      const all = await caches.keys();
      await Promise.all(all.map((k) => caches.delete(k)));
      await self.clients.claim();
      return keys;
    })(),
  );
});
self.addEventListener("fetch", () => {
  // Passthrough — do not handle, let the network serve fresh content.
});
