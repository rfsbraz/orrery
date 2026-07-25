// Orrery service worker.
//
// The museum is static and text-first, which makes it genuinely good offline:
// a reader on the metro should be able to keep walking a franchise they were
// already reading. Strategy by request type:
//
//   navigations  -> network first, fall back to cache, then the offline page.
//                   (Content changes when canon is republished, so the network
//                   wins when it is there; the cache is the safety net.)
//   static assets-> cache first (immutable, hashed filenames).
//   covers       -> stale-while-revalidate, capped, since they are remote and
//                   slow but rarely change.
//
// Anything with an auth cookie or a POST is never cached: personal progress
// and community writes must not be served stale or leak between users.

const VERSION = "orrery-v2";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const COVERS = `${VERSION}-covers`;
const OFFLINE_URL = "/offline";
const COVER_LIMIT = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll([OFFLINE_URL])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

/** Keep a cache from growing without bound (oldest entries evicted first). */
async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Book covers (remote): stale-while-revalidate.
  if (/covers\.openlibrary\.org/.test(url.hostname)) {
    event.respondWith(
      caches.open(COVERS).then(async (cache) => {
        const hit = await cache.match(request);
        const net = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone()).then(() => trim(COVERS, COVER_LIMIT));
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Build assets are content-hashed: cache first, forever.
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons")) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // Never cache anything personal or interactive.
  if (/^\/(me|u|moderate|import|login|api)\b/.test(url.pathname)) return;

  // Pages: network first, cache as backup, offline page as the last resort.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(request);
          return hit || caches.match(OFFLINE_URL);
        })
    );
  }
});
