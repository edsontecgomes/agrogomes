import type {
  ChecklistResposta,
  ChecklistTemplate,
  ExecucaoServico,
  OrdemServico,
  PathPoint,
} from "../types";

const STORAGE_KEY =
  "eqtara_offline_operational_store_v1";

export const OFFLINE_OPERATIONAL_STORE_EVENT =
  "eqtara:offline-operational-store-changed";

interface OfflineOperationalState {
  ordensPorFazenda: Record<string, OrdemServico[]>;
  templatesPorFazenda: Record<
    string,
    ChecklistTemplate[]
  >;
  respostas: ChecklistResposta[];
  execucoes: ExecucaoServico[];
}

function emptyState(): OfflineOperationalState {
  return {
    ordensPorFazenda: {},
    templatesPorFazenda: {},
    respostas: [],
    execucoes: [],
  };
}

function parseDate(
  value: unknown,
): Date | undefined {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return undefined;
}

function hydrateOrder(
  order: OrdemServico,
): OrdemServico {
  return {
    ...order,
    createdAt:
      parseDate(order.createdAt) ||
      new Date(),
    janelaInicio: parseDate(
      order.janelaInicio,
    ),
    janelaFim: parseDate(
      order.janelaFim,
    ),
  };
}

function hydrateTemplate(
  template: ChecklistTemplate,
): ChecklistTemplate {
  return {
    ...template,
    createdAt:
      parseDate(template.createdAt) ||
      new Date(),
  };
}

function hydrateResponse(
  response: ChecklistResposta,
): ChecklistResposta {
  return {
    ...response,
    createdAt:
      parseDate(response.createdAt) ||
      new Date(),
  };
}

function hydrateExecution(
  execution: ExecucaoServico,
): ExecucaoServico {
  return {
    ...execution,
    dataInicio: parseDate(
      execution.dataInicio,
    ),
    dataFim: parseDate(execution.dataFim),
    createdAt:
      parseDate(execution.createdAt) ||
      new Date(),
  };
}

function readState(): OfflineOperationalState {
  if (
    typeof localStorage === "undefined"
  ) {
    return emptyState();
  }

  const raw = localStorage.getItem(
    STORAGE_KEY,
  );

  if (!raw) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(
      raw,
    ) as Partial<OfflineOperationalState>;

    const ordensPorFazenda =
      Object.fromEntries(
        Object.entries(
          parsed.ordensPorFazenda || {},
        ).map(([farmId, orders]) => [
          farmId,
          (orders || []).map(hydrateOrder),
        ]),
      );

    const templatesPorFazenda =
      Object.fromEntries(
        Object.entries(
          parsed.templatesPorFazenda || {},
        ).map(([farmId, templates]) => [
          farmId,
          (templates || []).map(
            hydrateTemplate,
          ),
        ]),
      );

    return {
      ordensPorFazenda,
      templatesPorFazenda,
      respostas: (
        parsed.respostas || []
      ).map(hydrateResponse),
      execucoes: (
        parsed.execucoes || []
      ).map(hydrateExecution),
    };
  } catch (error) {
    console.error(
      "Não foi possível ler o armazenamento operacional offline.",
      error,
    );

    return emptyState();
  }
}

function notifyChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      OFFLINE_OPERATIONAL_STORE_EVENT,
    ),
  );
}

function writeState(
  state: OfflineOperationalState,
) {
  if (
    typeof localStorage === "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state),
  );

  notifyChanged();
}

export function cacheOrdensServico(
  farmId: string,
  orders: OrdemServico[],
) {
  const state = readState();

  state.ordensPorFazenda[farmId] =
    orders.map(hydrateOrder);

  writeState(state);
}

export function getCachedOrdensServico(
  farmId: string,
): OrdemServico[] {
  return (
    readState().ordensPorFazenda[
      farmId
    ] || []
  ).map(hydrateOrder);
}

export function updateCachedOrdemServico(
  farmId: string,
  orderId: string,
  updates: Partial<OrdemServico>,
) {
  const state = readState();
  const orders =
    state.ordensPorFazenda[farmId] || [];

  state.ordensPorFazenda[farmId] =
    orders.map((order) =>
      order.id === orderId
        ? hydrateOrder({
            ...order,
            ...updates,
          })
        : order,
    );

  writeState(state);
}

export function getCachedOrdemServico(
  farmId: string,
  orderId: string,
): OrdemServico | null {
  return (
    getCachedOrdensServico(
      farmId,
    ).find(
      (order) => order.id === orderId,
    ) || null
  );
}

export function findCachedOrdemServico(
  orderId: string,
): OrdemServico | null {
  const state = readState();

  for (const orders of Object.values(
    state.ordensPorFazenda,
  )) {
    const order = orders.find(
      (current) =>
        current.id === orderId,
    );

    if (order) {
      return hydrateOrder(order);
    }
  }

  return null;
}

export function cacheChecklistTemplates(
  farmId: string,
  templates: ChecklistTemplate[],
) {
  const state = readState();

  state.templatesPorFazenda[farmId] =
    templates.map(hydrateTemplate);

  writeState(state);
}

export function getCachedChecklistTemplates(
  farmId: string,
): ChecklistTemplate[] {
  return (
    readState().templatesPorFazenda[
      farmId
    ] || []
  ).map(hydrateTemplate);
}

export function upsertLocalChecklistResponse(
  response: ChecklistResposta,
) {
  const state = readState();
  const nextResponse =
    hydrateResponse(response);

  state.respostas = [
    nextResponse,
    ...state.respostas.filter(
      (current) =>
        current.id !== response.id,
    ),
  ];

  writeState(state);
}

export function getLocalChecklistResponses(
  farmId?: string,
): ChecklistResposta[] {
  return readState()
    .respostas.filter(
      (response) =>
        !farmId ||
        response.farmId === farmId,
    )
    .map(hydrateResponse);
}

export function removeLocalChecklistResponse(
  responseId: string,
) {
  const state = readState();

  state.respostas =
    state.respostas.filter(
      (response) =>
        response.id !== responseId,
    );

  writeState(state);
}

export function upsertLocalExecucao(
  execution: ExecucaoServico,
) {
  const state = readState();
  const nextExecution =
    hydrateExecution(execution);

  state.execucoes = [
    nextExecution,
    ...state.execucoes.filter(
      (current) =>
        current.id !== execution.id,
    ),
  ];

  writeState(state);
}

export function cacheExecucoesServico(
  executions: ExecucaoServico[],
) {
  if (executions.length === 0) {
    return;
  }

  const state = readState();
  const executionsById = new Map(
    state.execucoes.map((execution) => [
      execution.id,
      execution,
    ]),
  );

  executions.forEach((execution) => {
    const localExecution =
      executionsById.get(execution.id);

    // A cópia pendente do aparelho é mais recente que a
    // última fotografia recebida do Firestore.
    if (
      localExecution?.sincronizado ===
      false
    ) {
      return;
    }

    executionsById.set(
      execution.id,
      hydrateExecution(execution),
    );
  });

  state.execucoes = Array.from(
    executionsById.values(),
  );

  writeState(state);
}

export function updateLocalExecucao(
  executionId: string,
  updates: Partial<ExecucaoServico>,
) {
  const state = readState();

  state.execucoes =
    state.execucoes.map((execution) =>
      execution.id === executionId
        ? hydrateExecution({
            ...execution,
            ...updates,
          })
        : execution,
    );

  writeState(state);
}

export function appendLocalPathPoints(
  executionId: string,
  points: PathPoint[],
) {
  const state = readState();

  state.execucoes =
    state.execucoes.map((execution) =>
      execution.id === executionId
        ? {
            ...execution,
            path: [
              ...(execution.path || []),
              ...points,
            ],
          }
        : execution,
    );

  writeState(state);
}

export function getLocalExecucoes(
  filters: {
    farmId?: string;
    ordemId?: string;
    operadorId?: string;
    statuses?: ExecucaoServico["status"][];
  } = {},
): ExecucaoServico[] {
  return readState()
    .execucoes.filter((execution) => {
      if (
        filters.farmId &&
        execution.farmId !== filters.farmId
      ) {
        return false;
      }

      if (
        filters.ordemId &&
        execution.ordemId !==
          filters.ordemId
      ) {
        return false;
      }

      if (
        filters.operadorId &&
        execution.operadorId !==
          filters.operadorId
      ) {
        return false;
      }

      if (
        filters.statuses &&
        !filters.statuses.includes(
          execution.status,
        )
      ) {
        return false;
      }

      return true;
    })
    .map(hydrateExecution);
}

export function removeLocalExecucao(
  executionId: string,
) {
  const state = readState();

  state.execucoes =
    state.execucoes.filter(
      (execution) =>
        execution.id !== executionId,
    );

  writeState(state);
}

export function mergeById<T extends {
  id: string;
}>(
  remote: T[],
  local: T[],
): T[] {
  const merged = new Map<string, T>();

  remote.forEach((item) => {
    merged.set(item.id, item);
  });

  local.forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
}
