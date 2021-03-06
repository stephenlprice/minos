const FILES_TO_CACHE =  [
  "/",
  "/index.html",
  // "/manifest.webmanifest", // decide if I will create one later
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const STATIC_CACHE = 'static-cache-v1';
const DATA_CACHE = 'data-cache-v1';

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

// removes old caches not listed on this file
self.addEventListener("activate", event => {
  const CACHES = [STATIC_CACHE, DATA_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // array of old cache names not included in CACHES
        return cacheNames.filter(
          cacheName => !CACHES.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          // remove each cache name included in previous array
          cachesToDelete.map(cacheToDelete => {
            console.log("removing old cache:", cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// caching network requests
self.addEventListener("fetch", event => {
  // Does not cache requests to other origins
  if (
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // any requests to api URLs
  if (event.request.url.includes('/api/')) {
    // make network request and fallback to cache if network request fails (is offline)
    event.respondWith(
      caches
        .open(DATA_CACHE)
        .then(cache => {
          return fetch(event.request)
            .then(response => {
              // if the response succeeds, cache a clone
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(err => {
              // If the network request failed, retrieve from the cache
              console.log('network unavailable, using cache until connectivity is restored...');
              return cache.match(event.request);
            });
        })
        .catch(err => console.error(err))
    );
    return;
  }

  // prioritize the cache for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }  

      // if request is not cached, make a network request and cache the response
      return caches.open(DATA_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone())
            .then(() => {
              return response;
            });
        });
      });
    })
  );

  // for static content respond with cached results if available or make a request
  // event.respondWith(
  //   caches
  //     .open(STATIC_CACHE)
  //     .then(cache => {
  //       return cache.match(event.request).then(response => {
  //         return response || fetch(event.request);
  //       });
  //     })
  // );
});
