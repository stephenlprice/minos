const FILES_TO_CACHE =  [
  "/",
  "/index.html",
  "/manifest.webmanifest", // decide if I will create one later
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

// install the service worker
self.addEventListener("install", (event) => {
  // pre caching data
  event.waitUntil(
    // caches.open(DATA_CACHE_NAME).then((cache) => cache.add())
  );
});