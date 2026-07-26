import { useEffect, useState } from "react";
import {
  getOfflineSyncQueue,
  OFFLINE_SYNC_QUEUE_EVENT,
} from "../services/offlineSyncQueue";
import { processOfflineSyncQueue } from "../services/offlineSyncService";
import { syncService } from "../services/syncService";

export function useOfflineSync() {
  const [queueSize, setQueueSize] = useState(0);
  const [
    operationalQueueSize,
    setOperationalQueueSize,
  ] = useState(
    syncService.getPendingCount(),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  function refreshQueueSize() {
    setQueueSize(getOfflineSyncQueue().length);
  }

  async function syncNow() {
    if (!navigator.onLine) return;

    setIsSyncing(true);

    try {
      await processOfflineSyncQueue();
      await syncService.processQueue();
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

    const unsubscribeOperational =
      syncService.subscribe(
        (status) => {
          setOperationalQueueSize(
            status.pending,
          );
        },
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

      unsubscribeOperational();
    };
  }, []);

  return {
    queueSize:
      queueSize +
      operationalQueueSize,
    isSyncing,
    syncNow,
  };
}
