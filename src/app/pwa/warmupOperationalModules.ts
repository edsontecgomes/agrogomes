const OFFLINE_MODULES_READY_KEY =
  "eqtara_offline_modules_ready_v1";

const operationalModuleLoaders = {
  painel: () =>
    import("../../components/AgronomicOnboarding"),
  agronomia: () =>
    import("../../modules/agronomia/AgronomiaHub"),
  chuvas: () =>
    import("../../modules/chuva/ChuvaDashboard"),
  servicos: () =>
    import(
      "../../modules/servicos/ServicosDashboard"
    ),
  checklist: () =>
    import(
      "../../modules/servicos/ChecklistRunner"
    ),
  operador: () =>
    import(
      "../../modules/operador/OperadorDashboard"
    ),
  talhoes: () =>
    import(
      "../../modules/talhoes/TalhoesDashboard"
    ),
  estoque: () =>
    import(
      "../../modules/estoque/EstoqueDashboard"
    ),
  combustivel: () =>
    import(
      "../../modules/combustivel/CombustivelDashboard"
    ),
  equipamentos: () =>
    import(
      "../../modules/equipamentos/EquipamentosDashboard"
    ),
  pecas: () =>
    import(
      "../../modules/pecas_manutencao/PecasManutencaoDashboard"
    ),
};

let warmedUp = false;
let warmingUp:
  Promise<boolean> | null = null;

export function getOperationalModuleIds() {
  return Object.keys(
    operationalModuleLoaders,
  );
}

export function hasOperationalModulesReady() {
  if (
    typeof localStorage === "undefined"
  ) {
    return false;
  }

  try {
    const raw = localStorage.getItem(
      OFFLINE_MODULES_READY_KEY,
    );

    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as {
      modules?: number;
    };

    return (
      parsed.modules ===
      getOperationalModuleIds().length
    );
  } catch {
    return false;
  }
}

function markOperationalModulesReady() {
  if (
    typeof localStorage === "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    OFFLINE_MODULES_READY_KEY,
    JSON.stringify({
      modules:
        getOperationalModuleIds().length,
      updatedAt:
        new Date().toISOString(),
    }),
  );
}

export async function warmupOperationalModules() {
  if (
    warmedUp ||
    (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    )
  ) {
    return warmedUp;
  }

  if (warmingUp) {
    return warmingUp;
  }

  warmingUp = (async () => {
    const results =
      await Promise.allSettled(
        Object.values(
          operationalModuleLoaders,
        ).map((loadModule) =>
          loadModule(),
        ),
      );

    const allLoaded =
      results.every(
        (result) =>
          result.status ===
          "fulfilled",
      );

    if (allLoaded) {
      warmedUp = true;
      markOperationalModulesReady();
    }

    return allLoaded;
  })();

  try {
    return await warmingUp;
  } finally {
    warmingUp = null;
  }
}
