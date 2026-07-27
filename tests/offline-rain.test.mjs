import assert from "node:assert/strict";
import test from "node:test";

class MemoryStorage {
  #values = new Map();

  clear() {
    this.#values.clear();
  }

  getItem(key) {
    return this.#values.has(key)
      ? this.#values.get(key)
      : null;
  }

  setItem(key, value) {
    this.#values.set(
      key,
      String(value),
    );
  }

  removeItem(key) {
    this.#values.delete(key);
  }
}

globalThis.localStorage =
  new MemoryStorage();
globalThis.window = new EventTarget();

const QUEUE_KEY =
  "gestao_agro_offline_sync_queue";

localStorage.setItem(
  QUEUE_KEY,
  JSON.stringify([
    {
      id: "item-interrompido",
      collectionName:
        "pluviometros",
      documentId: "pluv-1",
      operation: "create",
      payload: {
        farmId: "farm-1",
      },
      status: "sincronizando",
      tentativas: 1,
      createdAt:
        "2026-07-27T10:00:00.000Z",
      updatedAt:
        "2026-07-27T10:00:00.000Z",
    },
  ]),
);

const queue = await import(
  "../src/services/offlineSyncQueue.ts"
);

test(
  "recupera item cuja sincronização foi interrompida",
  () => {
    const [item] =
      queue.getOfflineSyncQueue();

    assert.equal(
      item.status,
      "pendente",
    );

    assert.match(
      item.erro,
      /interrompida/i,
    );
  },
);

test(
  "não duplica a mesma gravação determinística",
  () => {
    localStorage.clear();

    const params = {
      collectionName:
        "chuvas_comunitarias",
      documentId: "chuva-1",
      operation: "create",
      payload: {
        mm: 12.5,
        farmId: "farm-1",
        pluviometroId: "pluv-1",
        timestampMs: 1_800_000_000_000,
      },
    };

    queue.addOfflineSyncItem(
      params,
    );

    queue.addOfflineSyncItem({
      ...params,
      payload: {
        ...params.payload,
        mm: 13,
      },
    });

    const items =
      queue.getOfflineSyncQueue();

    assert.equal(items.length, 1);
    assert.equal(
      items[0].payload.mm,
      13,
    );
    assert.equal(
      items[0].status,
      "pendente",
    );
  },
);

test(
  "preserva os dados mínimos da chuva na fila",
  () => {
    localStorage.clear();

    queue.addOfflineSyncItem({
      collectionName:
        "chuvas_comunitarias",
      documentId: "chuva-2",
      operation: "create",
      payload: {
        mm: 18.2,
        location: {
          lat: -2.5,
          lng: -54.7,
          accuracy: 4,
        },
        timestampMs:
          1_800_000_000_000,
        userId: "operador-1",
        farmId: "farm-1",
        pluviometroId: "pluv-2",
        source: "manual",
      },
    });

    const [item] =
      queue.getPendingOfflineSyncItems();

    assert.equal(
      item.documentId,
      "chuva-2",
    );
    assert.equal(
      item.payload.mm,
      18.2,
    );
    assert.equal(
      item.payload.pluviometroId,
      "pluv-2",
    );
  },
);
