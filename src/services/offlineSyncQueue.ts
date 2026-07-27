import {
  OfflineSyncItem,
  OfflineSyncOperation,
} from "../types/offlineSync";

const OFFLINE_SYNC_QUEUE_KEY =
  "gestao_agro_offline_sync_queue";

export const OFFLINE_SYNC_QUEUE_EVENT =
  "eqtara:offline-sync-queue-changed";

let interruptedItemsRecovered = false;

function notifyQueueChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(OFFLINE_SYNC_QUEUE_EVENT),
  );
}

function readQueue(): OfflineSyncItem[] {
  const raw = localStorage.getItem(
    OFFLINE_SYNC_QUEUE_KEY,
  );

  if (!raw) return [];

  try {
    const queue = JSON.parse(
      raw,
    ) as OfflineSyncItem[];

    if (!interruptedItemsRecovered) {
      interruptedItemsRecovered = true;

      const recoveredQueue =
        queue.map((item) =>
          item.status ===
          "sincronizando"
            ? {
                ...item,
                status:
                  "pendente" as const,
                erro:
                  "Sincronização anterior interrompida; item reagendado.",
                updatedAt:
                  new Date().toISOString(),
              }
            : item,
        );

      if (
        recoveredQueue.some(
          (item, index) =>
            item !== queue[index],
        )
      ) {
        localStorage.setItem(
          OFFLINE_SYNC_QUEUE_KEY,
          JSON.stringify(
            recoveredQueue,
          ),
        );
      }

      return recoveredQueue;
    }

    return queue;
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineSyncItem[]) {
  localStorage.setItem(
    OFFLINE_SYNC_QUEUE_KEY,
    JSON.stringify(queue),
  );

  notifyQueueChanged();
}

export function getOfflineSyncQueue(): OfflineSyncItem[] {
  return readQueue();
}

export function getPendingOfflineSyncItems(): OfflineSyncItem[] {
  return readQueue().filter(
    (item) => item.status === "pendente",
  );
}

export function addOfflineSyncItem(params: {
  collectionName: string;
  documentId?: string;
  operation: OfflineSyncOperation;
  payload: Record<string, unknown>;
}): OfflineSyncItem {
  const now = new Date().toISOString();

  const item: OfflineSyncItem = {
    id: crypto.randomUUID(),
    collectionName: params.collectionName,
    documentId: params.documentId,
    operation: params.operation,
    payload: params.payload,
    status: "pendente",
    tentativas: 0,
    createdAt: now,
    updatedAt: now,
  };

  const queue = readQueue();

  const existingIndex = queue.findIndex(
    (queuedItem) =>
      Boolean(params.documentId) &&
      queuedItem.documentId ===
        params.documentId &&
      queuedItem.collectionName ===
        params.collectionName &&
      queuedItem.operation ===
        params.operation,
  );

  if (existingIndex >= 0) {
    const existing =
      queue[existingIndex];

    const updatedItem: OfflineSyncItem =
      {
        ...existing,
        payload: params.payload,
        status: "pendente",
        erro: undefined,
        updatedAt: now,
      };

    const nextQueue = [
      ...queue,
    ];

    nextQueue[existingIndex] =
      updatedItem;

    writeQueue(nextQueue);

    return updatedItem;
  }

  writeQueue([
    ...queue,
    item,
  ]);

  return item;
}

export function updateOfflineSyncItem(
  id: string,
  updates: Partial<OfflineSyncItem>,
) {
  const queue = readQueue();

  const nextQueue = queue.map((item) =>
    item.id === id
      ? {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );

  writeQueue(nextQueue);
}

export function removeOfflineSyncItem(id: string) {
  const queue = readQueue();

  writeQueue(
    queue.filter((item) => item.id !== id),
  );
}

export function clearSyncedOfflineItems() {
  const queue = readQueue();

  writeQueue(
    queue.filter(
      (item) => item.status !== "sincronizado",
    ),
  );
}
