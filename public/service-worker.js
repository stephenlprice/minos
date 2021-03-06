const FILES_TO_CACHE =  [
  "/",
  "/index.html",
  "/manifest.webmanifest", // decide if I will create one later
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const STATIC_CACHE = 'static-cache-v1';
const DATA_CACHE_ = 'data-cache-v1';

// installing service workers
self.addEventListener("install", (event) => {
  // pre caching /api/transaction data
  event.waitUntil(
    caches
      .open(DATA_CACHE)
      .then((cache) => cache.add("/api/transaction"))
      .then(() => self.skipWaiting())
  );

  // pre caching all static assets
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});