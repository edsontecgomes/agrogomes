import { OfflineSyncItem, OfflineSyncOperation } from "../types/offlineSync";

const OFFLINE_SYNC_QUEUE_KEY = "gestao_agro_offline_sync_queue";

function readQueue(): OfflineSyncItem[] {
  const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as OfflineSyncItem[];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineSyncItem[]) {
  localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineSyncQueue(): OfflineSyncItem[] {
  return readQueue();
}

export function getPendingOfflineSyncItems(): OfflineSyncItem[] {
  return readQueue().filter((item) => item.status === "pendente");
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

  writeQueue([...queue, item]);

  return item;
}

export function updateOfflineSyncItem(
  id: string,
  updates: Partial<OfflineSyncItem>
) {
  const queue = readQueue();

  const nextQueue = queue.map((item) =>
    item.id === id
      ? {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  writeQueue(nextQueue);
}

export function removeOfflineSyncItem(id: string) {
  const queue = readQueue();

  writeQueue(queue.filter((item) => item.id !== id));
}

export function clearSyncedOfflineItems() {
  const queue = readQueue();

  writeQueue(queue.filter((item) => item.status !== "sincronizado"));
}