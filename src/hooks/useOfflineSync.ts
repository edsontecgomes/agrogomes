import { useEffect, useState } from "react";
import {
  getOfflineSyncQueue,
  OFFLINE_SYNC_QUEUE_EVENT,
} from "../services/offlineSyncQueue";
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

    function handleQueueChanged() {
      refreshQueueSize();
    }

    function handleOnline() {
      void syncNow();
    }

    window.addEventListener(
      OFFLINE_SYNC_QUEUE_EVENT,
      handleQueueChanged,
    );

    window.addEventListener(
      "online",
      handleOnline,
    );

    if (navigator.onLine) {
      void syncNow();
    }

    return () => {
      window.removeEventListener(
        OFFLINE_SYNC_QUEUE_EVENT,
        handleQueueChanged,
      );

      window.removeEventListener(
        "online",
        handleOnline,
      );
    };
  }, []);

  return {
    queueSize,
    isSyncing,
    syncNow,
  };
}
