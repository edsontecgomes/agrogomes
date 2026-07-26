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

const store = await import(
  "../src/services/offlineOperationalStore.ts"
);

test(
  "preserva ordens e datas para consulta offline",
  () => {
    localStorage.clear();

    store.cacheOrdensServico(
      "farm-1",
      [
        {
          id: "ordem-1",
          farmId: "farm-1",
          titulo: "Plantio",
          tipoOperacao: "Plantio",
          talhaoId: "talhao-1",
          status: "pendente",
          createdBy: "gestor-1",
          createdAt: new Date(
            "2026-07-26T10:00:00.000Z",
          ),
        },
      ],
    );

    const [order] =
      store.getCachedOrdensServico(
        "farm-1",
      );

    assert.equal(order.id, "ordem-1");
    assert.equal(
      order.createdAt instanceof Date,
      true,
    );

    store.updateCachedOrdemServico(
      "farm-1",
      "ordem-1",
      { status: "em_execucao" },
    );

    assert.equal(
      store.getCachedOrdemServico(
        "farm-1",
        "ordem-1",
      ).status,
      "em_execucao",
    );
  },
);

test(
  "mantém execução e rota no armazenamento local",
  () => {
    localStorage.clear();

    store.upsertLocalExecucao({
      id: "execucao-1",
      ordemId: "ordem-1",
      farmId: "farm-1",
      talhaoId: "talhao-1",
      operadorId: "operador-1",
      status: "em_execucao",
      dataInicio: new Date(
        "2026-07-26T11:00:00.000Z",
      ),
      createdAt: new Date(
        "2026-07-26T11:00:00.000Z",
      ),
      path: [],
      sincronizado: false,
    });

    store.appendLocalPathPoints(
      "execucao-1",
      [
        {
          lat: -2.5,
          lng: -54.7,
          accuracy: 4,
          timestamp: 1_000,
        },
      ],
    );

    const [execution] =
      store.getLocalExecucoes({
        farmId: "farm-1",
        statuses: ["em_execucao"],
      });

    assert.equal(
      execution.path.length,
      1,
    );
    assert.equal(
      execution.dataInicio instanceof Date,
      true,
    );
  },
);

test(
  "mantém execução remota disponível após perder a conexão",
  () => {
    localStorage.clear();

    store.cacheExecucoesServico([
      {
        id: "execucao-remota-1",
        ordemId: "ordem-1",
        farmId: "farm-1",
        talhaoId: "talhao-1",
        operadorId: "operador-1",
        operadorNome: "Operador",
        status: "em_execucao",
        dataInicio: new Date(
          "2026-07-26T12:00:00.000Z",
        ),
        createdAt: new Date(
          "2026-07-26T12:00:00.000Z",
        ),
        path: [],
        sincronizado: true,
      },
    ]);

    const [execution] =
      store.getLocalExecucoes({
        farmId: "farm-1",
        statuses: ["em_execucao"],
      });

    assert.equal(
      execution.id,
      "execucao-remota-1",
    );
    assert.equal(
      execution.dataInicio.toISOString(),
      "2026-07-26T12:00:00.000Z",
    );
  },
);
