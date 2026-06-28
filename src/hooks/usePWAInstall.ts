import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function isRunningAsStandalone() {
  const isStandaloneDisplay =
    window.matchMedia("(display-mode: standalone)").matches;

  const isIosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return isStandaloneDisplay || isIosStandalone;
}

export function usePWAInstall() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isRunningAsStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();

      if (isRunningAsStandalone()) {
        setCanInstall(false);
        setInstallEvent(null);
        setIsInstalled(true);
        return;
      }

      setInstallEvent(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    }

    function handleAppInstalled() {
      setCanInstall(false);
      setInstallEvent(null);
      setIsInstalled(true);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;

    await installEvent.prompt();

    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setCanInstall(false);
      setInstallEvent(null);
      setIsInstalled(true);
    }
  }

  return {
    canInstall,
    installApp,
    isInstalled,
  };
}