import { useEffect, useState } from "react";
import { getOfflineSyncQueue } from "../services/offlineSyncQueue";
import { processOfflineSyncQueue } from "../services/offlineSyncService";

export function useOfflineSync() {
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  function refreshQueueSize() {
    setQueueSize(getOfflineSyncQueue().length);
  }

  async function syncNow() {
    if (!navigator.onLine) return;

    setIsSyncing(true);

    try {
      await processOfflineSyncQueue();
      refreshQueueSize();
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    refreshQueueSize();

    function handleOnline() {
      void syncNow();
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return {
    queueSize,
    isSyncing,
    syncNow,
  };
}