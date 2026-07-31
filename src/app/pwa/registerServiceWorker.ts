import { warmupOperationalModules } from "./warmupOperationalModules";

function getCurrentApplicationUrls() {
  const urls = new Set<string>([
    "/",
    "/manifest.webmanifest",
    window.location.pathname,
  ]);

  performance
    .getEntriesByType("resource")
    .forEach((entry) => {
      const url = new URL(entry.name);

      if (
        url.origin ===
        window.location.origin
      ) {
        urls.add(url.href);
      }
    });

  return Array.from(urls);
}

function askServiceWorkerToCacheCurrentApp(
  registration:
    ServiceWorkerRegistration,
) {
  const serviceWorker =
    navigator.serviceWorker.controller ||
    registration.active ||
    registration.waiting;

  serviceWorker?.postMessage({
    type: "CACHE_URLS",
    urls:
      getCurrentApplicationUrls(),
  });
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    let registration:
      ServiceWorkerRegistration | null =
      null;

    navigator.serviceWorker
      .register("/sw.js")
      .then(
        (registeredServiceWorker) => {
          registration =
            registeredServiceWorker;

          return navigator
            .serviceWorker.ready;
        },
      )
      .then((readyRegistration) => {
        registration =
          readyRegistration;

        askServiceWorkerToCacheCurrentApp(
          readyRegistration,
        );

        window.setTimeout(() => {
          void warmupOperationalModules()
            .then(() => {
              if (registration) {
                askServiceWorkerToCacheCurrentApp(
                  registration,
                );
              }
            });
        }, 1500);
      })
      .catch((error) => {
        console.error("Erro ao registrar Service Worker:", error);
      });
  });

  window.addEventListener(
    "online",
    () => {
      void navigator.serviceWorker.ready
        .then((registration) => {
          askServiceWorkerToCacheCurrentApp(
            registration,
          );

          return warmupOperationalModules();
        })
        .then(() =>
          navigator.serviceWorker.ready,
        )
        .then((registration) => {
          askServiceWorkerToCacheCurrentApp(
            registration,
          );
        });
    },
  );
}
