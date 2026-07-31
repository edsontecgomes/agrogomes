const APP_CACHE_PREFIX =
  "eqtara-operacional-cache-";
const APP_CACHE_NAME =
  `${APP_CACHE_PREFIX}v3`;
const MAP_TILE_CACHE_NAME =
  "map-tiles-cache";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
];

function isOpenStreetMapTile(url) {
  return (
    url.hostname.endsWith(
      ".tile.openstreetmap.org",
    ) ||
    url.hostname ===
      "tile.openstreetmap.org"
  );
}

async function cacheResponse(
  cacheName,
  request,
  response,
) {
  if (
    !response ||
    (!response.ok &&
      response.type !== "opaque")
  ) {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function cacheApplicationUrls(urls) {
  const cache =
    await caches.open(APP_CACHE_NAME);

  await Promise.allSettled(
    urls
      .filter(
        (value) =>
          typeof value === "string",
      )
      .map(async (value) => {
        const url = new URL(
          value,
          self.location.origin,
        );

        if (
          url.origin !==
          self.location.origin
        ) {
          return;
        }

        const response =
          await fetch(url.href, {
            credentials: "same-origin",
          });

        if (response.ok) {
          await cache.put(
            url.href,
            response,
          );
        }
      }),
  );
}

async function cacheShellAndAssets() {
  await cacheApplicationUrls(APP_SHELL);

  try {
    const response = await fetch("/", {
      credentials: "same-origin",
    });
    const html = await response.text();
    const assetUrls = Array.from(
      html.matchAll(
        /(?:src|href)=["']([^"']+)["']/g,
      ),
      (match) => match[1],
    ).filter(
      (url) =>
        url.startsWith("/assets/") ||
        url === "/manifest.webmanifest",
    );

    await cacheApplicationUrls(assetUrls);
  } catch {
    // A instalação ainda mantém o shell mínimo
    // quando a rede oscila.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShellAndAssets());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(
                APP_CACHE_PREFIX,
              ) &&
              key !== APP_CACHE_NAME,
          )
          .map((key) =>
            caches.delete(key),
          ),
      ),
    ),
  );

  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (
    event.data?.type !== "CACHE_URLS" ||
    !Array.isArray(event.data.urls)
  ) {
    return;
  }

  event.waitUntil(
    cacheApplicationUrls(event.data.urls),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (isOpenStreetMapTile(url)) {
    event.respondWith(
      caches
        .open(MAP_TILE_CACHE_NAME)
        .then(async (cache) => {
          const cached =
            await cache.match(request);

          if (cached) {
            return cached;
          }

          const response =
            await fetch(request);

          if (
            response.ok ||
            response.type === "opaque"
          ) {
            await cache.put(
              request,
              response.clone(),
            );
          }

          return response;
        }),
    );

    return;
  }

  if (
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          event.waitUntil(
            cacheResponse(
              APP_CACHE_NAME,
              request,
              response,
            ),
          );

          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
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
              event.waitUntil(
                cacheResponse(
                  APP_CACHE_NAME,
                  request,
                  response,
                ),
              );

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
