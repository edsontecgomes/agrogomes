import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import {
  getPendingOfflineSyncItems,
  removeOfflineSyncItem,
  updateOfflineSyncItem,
} from "./offlineSyncQueue";

function withCreateMetadata(
  collectionName: string,
  payload: Record<string, unknown>,
) {
  const {
    timestampMs,
    ...remainingPayload
  } = payload;

  const shouldRestoreTimestamp =
    collectionName ===
      "chuvas_comunitarias" ||
    collectionName ===
      "registros_pessoais";

  return {
    ...remainingPayload,
    ...(shouldRestoreTimestamp &&
    typeof timestampMs === "number" &&
    Number.isFinite(timestampMs)
      ? {
          timestamp: new Date(
            timestampMs,
          ),
        }
      : {}),
    ...(remainingPayload.createdAt ===
    undefined
      ? { createdAt: serverTimestamp() }
      : {}),
    syncedAt: serverTimestamp(),
  };
}

async function syncCreate(
  collectionName: string,
  payload: Record<string, unknown>,
  documentId?: string,
) {
  const data = withCreateMetadata(
    collectionName,
    payload,
  );

  if (documentId) {
    await setDoc(
      doc(db, collectionName, documentId),
      data,
    );

    return;
  }

  await addDoc(
    collection(db, collectionName),
    data,
  );
}

async function syncUpdate(
  collectionName: string,
  documentId: string,
  payload: Record<string, unknown>,
) {
  await updateDoc(
    doc(db, collectionName, documentId),
    {
      ...payload,
      syncedAt: serverTimestamp(),
    },
  );
}

async function syncDelete(
  collectionName: string,
  documentId: string,
) {
  await deleteDoc(
    doc(db, collectionName, documentId),
  );
}

export async function processOfflineSyncQueue() {
  if (!navigator.onLine) return;

  const pendingItems =
    getPendingOfflineSyncItems();

  for (const item of pendingItems) {
    try {
      updateOfflineSyncItem(item.id, {
        status: "sincronizando",
        tentativas: item.tentativas + 1,
      });

      if (item.operation === "create") {
        await syncCreate(
          item.collectionName,
          item.payload,
          item.documentId,
        );
      }

      if (item.operation === "update") {
        if (!item.documentId) {
          throw new Error(
            "documentId obrigatório para update.",
          );
        }

        await syncUpdate(
          item.collectionName,
          item.documentId,
          item.payload,
        );
      }

      if (item.operation === "delete") {
        if (!item.documentId) {
          throw new Error(
            "documentId obrigatório para delete.",
          );
        }

        await syncDelete(
          item.collectionName,
          item.documentId,
        );
      }

      removeOfflineSyncItem(item.id);
    } catch (error) {
      updateOfflineSyncItem(item.id, {
        status: "pendente",
        erro:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao sincronizar.",
      });
    }
  }
}
