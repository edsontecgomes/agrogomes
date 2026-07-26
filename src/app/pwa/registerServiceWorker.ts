import { warmupOperationalModules } from "./warmupOperationalModules";

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() =>
        navigator.serviceWorker.ready
      )
      .then(() => {
        window.setTimeout(() => {
          void warmupOperationalModules();
        }, 1500);
      })
      .catch((error) => {
        console.error("Erro ao registrar Service Worker:", error);
      });
  });

  window.addEventListener(
    "online",
    () => {
      void warmupOperationalModules();
    },
  );
}
