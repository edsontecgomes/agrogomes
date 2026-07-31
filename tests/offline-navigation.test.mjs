import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
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

class NodeCustomEvent extends Event {
  constructor(type, options = {}) {
    super(type);
    this.detail = options.detail;
  }
}

globalThis.localStorage =
  new MemoryStorage();
globalThis.window = new EventTarget();
globalThis.CustomEvent =
  globalThis.CustomEvent ||
  NodeCustomEvent;

const referenceStore = await import(
  "../src/services/offlineReferenceStore.ts"
);
const moduleWarmup = await import(
  "../src/app/pwa/warmupOperationalModules.ts"
);

function seedFarmReferences(
  farmId,
  suffix,
) {
  referenceStore.cacheTalhoes(
    farmId,
    [
      {
        id: `talhao-${suffix}`,
        nome: `Talhão ${suffix}`,
        farmId,
        producerId: "produtor-1",
        coordenadas: [
          {
            lat: -2.5,
            lng: -54.7,
          },
        ],
      },
    ],
  );

  referenceStore.cacheEquipamentos(
    farmId,
    [
      {
        id: `maquina-${suffix}`,
        farmId,
        nome: `Trator ${suffix}`,
        tipo: "maquina",
        ativo: true,
      },
    ],
  );

  referenceStore.cacheProdutos(
    farmId,
    [
      {
        id: `produto-${suffix}`,
        farmId,
        producerId: "produtor-1",
        nome: `Semente ${suffix}`,
        categoria: "Semente",
        unidade: "kg",
        estoqueAtual: 100,
        estoqueMinimo: 10,
        ativo: true,
      },
    ],
  );

  referenceStore.cacheUEIs(
    farmId,
    [
      {
        id: `uei-${suffix}`,
        farmId,
        producerId: "produtor-1",
        talhaoId: `talhao-${suffix}`,
        codigo: `UEI-${suffix}`,
        nome: `UEI ${suffix}`,
        numero: 1,
        areaHa: 1,
        geometria: [
          {
            lat: -2.5,
            lng: -54.7,
          },
        ],
        origem: "grid",
        status: "ativa",
      },
    ],
  );
}

test(
  "preserva referências operacionais por fazenda",
  () => {
    localStorage.clear();

    seedFarmReferences(
      "farm-1",
      "A",
    );
    seedFarmReferences(
      "farm-2",
      "B",
    );

    assert.equal(
      referenceStore.getCachedTalhoes(
        "farm-1",
      )[0].id,
      "talhao-A",
    );
    assert.equal(
      referenceStore.getCachedEquipamentos(
        "farm-2",
      )[0].id,
      "maquina-B",
    );
    assert.equal(
      referenceStore.getCachedUEIs(
        "farm-1",
        "talhao-A",
      ).length,
      1,
    );
  },
);

test(
  "atualiza o cache local ao reconectar",
  () => {
    localStorage.clear();

    seedFarmReferences(
      "farm-1",
      "antigo",
    );

    referenceStore.cacheProdutos(
      "farm-1",
      [
        {
          id: "produto-novo",
          farmId: "farm-1",
          producerId: "produtor-1",
          nome: "Semente nova",
          categoria: "Semente",
          unidade: "kg",
          estoqueAtual: 250,
          estoqueMinimo: 20,
          ativo: true,
        },
      ],
    );

    const [produto] =
      referenceStore.getCachedProdutos(
        "farm-1",
      );

    assert.equal(
      produto.id,
      "produto-novo",
    );
    assert.equal(
      produto.estoqueAtual,
      250,
    );
  },
);

test(
  "informa se há dados mínimos para operar offline",
  () => {
    localStorage.clear();

    seedFarmReferences(
      "farm-1",
      "A",
    );

    const summary =
      referenceStore.getOfflineReferenceSummary(
        "farm-1",
      );

    assert.equal(
      summary.prontoParaOperacao,
      true,
    );
    assert.deepEqual(
      {
        talhoes: summary.talhoes,
        equipamentos:
          summary.equipamentos,
        produtos: summary.produtos,
        ueis: summary.ueis,
      },
      {
        talhoes: 1,
        equipamentos: 1,
        produtos: 1,
        ueis: 1,
      },
    );
    assert.equal(
      summary.atualizadoEm instanceof
        Date,
      true,
    );
  },
);

test(
  "prepara todos os módulos de campo para navegação offline",
  () => {
    const moduleIds =
      moduleWarmup.getOperationalModuleIds();

    assert.deepEqual(
      [
        "chuvas",
        "servicos",
        "checklist",
        "talhoes",
        "estoque",
        "equipamentos",
      ].filter(
        (moduleId) =>
          !moduleIds.includes(moduleId),
      ),
      [],
    );

    localStorage.setItem(
      "eqtara_offline_modules_ready_v1",
      JSON.stringify({
        modules: moduleIds.length,
        updatedAt:
          "2026-07-27T12:00:00.000Z",
      }),
    );

    assert.equal(
      moduleWarmup.hasOperationalModulesReady(),
      true,
    );
  },
);

test(
  "service worker preserva mapas e aceita novos arquivos do app",
  async () => {
    const serviceWorker =
      await readFile(
        new URL(
          "../public/sw.js",
          import.meta.url,
        ),
        "utf8",
      );

    assert.match(
      serviceWorker,
      /map-tiles-cache/,
    );
    assert.match(
      serviceWorker,
      /CACHE_URLS/,
    );
    assert.match(
      serviceWorker,
      /key\.startsWith\(\s*APP_CACHE_PREFIX/,
    );
  },
);
