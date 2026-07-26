const CACHE_NAME =
  "eqtara-operacional-cache-v2";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(APP_SHELL),
      ),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseCopy =
            response.clone();

          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) =>
                cache.put(
                  request,
                  responseCopy,
                ),
              ),
          );

          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(
              request,
            )) ||
            (await caches.match("/"))
          );
        }),
    );

    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cachedResponse) => {
        const networkResponse =
          fetch(request)
            .then((response) => {
              if (
                response.ok ||
                response.type ===
                  "opaque"
              ) {
                const responseCopy =
                  response.clone();

                event.waitUntil(
                  caches
                    .open(CACHE_NAME)
                    .then((cache) =>
                      cache.put(
                        request,
                        responseCopy,
                      ),
                    ),
                );
              }

              return response;
            });

        if (cachedResponse) {
          event.waitUntil(
            networkResponse.catch(
              () => undefined,
            ),
          );

          return cachedResponse;
        }

        return networkResponse;
      },
    ),
  );
});
