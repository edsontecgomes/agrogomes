import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import type {
  ExecucaoServico,
  Location,
  OrdemServico,
} from "../types";
import { auth, db } from "./firebase";
import {
  updateCachedOrdemServico,
  updateLocalExecucao,
  upsertLocalExecucao,
} from "./offlineOperationalStore";
import { syncService } from "./syncService";

interface IniciarExecucaoParams {
  ordem: OrdemServico;
  farmId: string;
  operadorId?: string;
  operadorNome?: string;
  location?: Location;
  origemStart?:
    | "manual"
    | "automatic_geofence";
  horimetroInicial?: number;
}

interface AtualizarExecucaoParams {
  execucaoId: string;
  ordemId: string;
  farmId: string;
}

interface FinalizarExecucaoParams
  extends AtualizarExecucaoParams {
  location?: Location;
  horimetroFinal?: number;
}

function currentOperatorId(
  operatorId?: string,
) {
  return (
    operatorId ||
    auth.currentUser?.uid ||
    ""
  );
}

function currentOperatorName(
  operatorName?: string,
) {
  return (
    operatorName ||
    auth.currentUser?.displayName ||
    "Operador"
  );
}

function executionPayload(
  execution: ExecucaoServico,
) {
  const {
    id,
    dataInicio,
    dataFim,
    createdAt,
    ...data
  } = execution;

  return {
    id,
    ...data,
    dataInicioMs:
      dataInicio?.getTime() ||
      Date.now(),
    dataFimMs: dataFim?.getTime(),
    createdAtMs: createdAt.getTime(),
  };
}

function queueOrderStatus(
  farmId: string,
  orderId: string,
  status: OrdemServico["status"],
) {
  updateCachedOrdemServico(
    farmId,
    orderId,
    { status },
  );

  syncService.enqueue(
    "UPDATE_ORDEM_SERVICO",
    {
      id: orderId,
      farmId,
      status,
      updatedAtMs: Date.now(),
    },
  );
}

function queueHorimeter(params: {
  farmId: string;
  order: OrdemServico;
  operatorId: string;
  operatorName: string;
  value: number;
  moment: "abertura" | "fechamento";
}) {
  if (!params.order.maquinaId) {
    return;
  }

  const recordId = doc(
    collection(db, "horimetros"),
  ).id;

  syncService.enqueue(
    "CREATE_HORIMETRO",
    {
      id: recordId,
      farmId: params.farmId,
      producerId: params.operatorId,
      maquinaId:
        params.order.maquinaId,
      maquinaNome:
        params.order.maquinaNome || "",
      horimetroAnterior: params.value,
      horimetroAtual: params.value,
      dataRegistroMs: Date.now(),
      operadorId: params.operatorId,
      operadorNome: params.operatorName,
      observacao:
        `${
          params.moment === "abertura"
            ? "Abertura"
            : "Fechamento"
        } da Ordem #${params.order.id.slice(
          -6,
        )}`,
    },
  );
}

export async function iniciarExecucaoOperacional(
  params: IniciarExecucaoParams,
): Promise<string> {
  const operatorId = currentOperatorId(
    params.operadorId,
  );
  const operatorName =
    currentOperatorName(
      params.operadorNome,
    );
  const executionId = doc(
    collection(
      db,
      "execucoes_servico",
    ),
  ).id;
  const now = new Date();

  const execution: ExecucaoServico = {
    id: executionId,
    ordemId: params.ordem.id,
    farmId: params.farmId,
    talhaoId: params.ordem.talhaoId,
    operadorId: operatorId,
    operadorNome: operatorName,
    status: "em_execucao",
    dataInicio: now,
    createdAt: now,
    origemStart:
      params.origemStart || "manual",
    path: [],
    produtos: params.ordem.produtos || [],
    sincronizado: navigator.onLine,
    ...(params.location
      ? {
          locationStart:
            params.location,
        }
      : {}),
    ...(params.ordem.maquinaId
      ? {
          maquinaId:
            params.ordem.maquinaId,
        }
      : {}),
    ...(params.ordem.maquinaNome
      ? {
          maquinaNome:
            params.ordem.maquinaNome,
        }
      : {}),
    ...(params.ordem.implementoId
      ? {
          implementoId:
            params.ordem.implementoId,
        }
      : {}),
    ...(params.ordem.implementoNome
      ? {
          implementoNome:
            params.ordem.implementoNome,
        }
      : {}),
    ...(params.horimetroInicial !==
    undefined
      ? {
          horimetroInicial:
            params.horimetroInicial,
        }
      : {}),
  };

  upsertLocalExecucao(execution);

  if (!navigator.onLine) {
    syncService.enqueue(
      "CREATE_EXECUCAO",
      executionPayload(execution),
    );
    queueOrderStatus(
      params.farmId,
      params.ordem.id,
      "em_execucao",
    );

    if (
      params.horimetroInicial !==
      undefined
    ) {
      queueHorimeter({
        farmId: params.farmId,
        order: params.ordem,
        operatorId,
        operatorName,
        value:
          params.horimetroInicial,
        moment: "abertura",
      });
    }

    return executionId;
  }

  try {
    const batch = writeBatch(db);
    const {
      id: _id,
      sincronizado: _synced,
      dataInicio: _start,
      createdAt: _created,
      ...firestoreData
    } = execution;

    batch.set(
      doc(
        db,
        "execucoes_servico",
        executionId,
      ),
      {
        ...firestoreData,
        dataInicio: now,
        createdAt: now,
        sincronizado: true,
      },
    );

    batch.update(
      doc(
        db,
        "ordens_servico",
        params.ordem.id,
      ),
      {
        status: "em_execucao",
        updatedAt: serverTimestamp(),
      },
    );

    if (
      params.horimetroInicial !==
        undefined &&
      params.ordem.maquinaId
    ) {
      const horimeterRef = doc(
        collection(db, "horimetros"),
      );

      batch.set(horimeterRef, {
        farmId: params.farmId,
        producerId: operatorId,
        maquinaId:
          params.ordem.maquinaId,
        maquinaNome:
          params.ordem.maquinaNome || "",
        horimetroAnterior:
          params.horimetroInicial,
        horimetroAtual:
          params.horimetroInicial,
        dataRegistro: now,
        operadorId: operatorId,
        operadorNome: operatorName,
        observacao:
          `Abertura da Ordem #${params.ordem.id.slice(
            -6,
          )}`,
        createdAt: now,
      });

      batch.update(
        doc(
          db,
          "equipamentos",
          params.ordem.maquinaId,
        ),
        {
          horimetroAtual:
            params.horimetroInicial,
          ultimaAtualizacaoHorimetro:
            serverTimestamp(),
        },
      );
    }

    await batch.commit();

    updateCachedOrdemServico(
      params.farmId,
      params.ordem.id,
      { status: "em_execucao" },
    );

    return executionId;
  } catch (error) {
    updateLocalExecucao(executionId, {
      sincronizado: false,
    });

    syncService.enqueue(
      "CREATE_EXECUCAO",
      executionPayload({
        ...execution,
        sincronizado: false,
      }),
    );
    queueOrderStatus(
      params.farmId,
      params.ordem.id,
      "em_execucao",
    );

    if (
      params.horimetroInicial !==
      undefined
    ) {
      queueHorimeter({
        farmId: params.farmId,
        order: params.ordem,
        operatorId,
        operatorName,
        value:
          params.horimetroInicial,
        moment: "abertura",
      });
    }

    console.warn(
      "Início preservado localmente para sincronização.",
      error,
    );

    return executionId;
  }
}

async function updateExecution(
  params: AtualizarExecucaoParams,
  updates: Partial<ExecucaoServico>,
  orderStatus?: OrdemServico["status"],
) {
  updateLocalExecucao(
    params.execucaoId,
    {
      ...updates,
      sincronizado: navigator.onLine,
    },
  );

  const updatePayload = {
    id: params.execucaoId,
    ...updates,
    dataFimMs:
      updates.dataFim?.getTime(),
    dataFim: undefined,
    updatedAtMs: Date.now(),
  };

  if (!navigator.onLine) {
    syncService.enqueue(
      "UPDATE_EXECUCAO",
      updatePayload,
    );

    if (orderStatus) {
      queueOrderStatus(
        params.farmId,
        params.ordemId,
        orderStatus,
      );
    }

    return;
  }

  try {
    const batch = writeBatch(db);
    const {
      dataFim: _date,
      ...firestoreUpdates
    } = updates;

    batch.update(
      doc(
        db,
        "execucoes_servico",
        params.execucaoId,
      ),
      {
        ...firestoreUpdates,
        ...(updates.dataFim
          ? {
              dataFim:
                updates.dataFim,
            }
          : {}),
        updatedAt: serverTimestamp(),
      },
    );

    if (orderStatus) {
      batch.update(
        doc(
          db,
          "ordens_servico",
          params.ordemId,
        ),
        {
          status: orderStatus,
          updatedAt:
            serverTimestamp(),
        },
      );
    }

    await batch.commit();
  } catch (error) {
    updateLocalExecucao(
      params.execucaoId,
      { sincronizado: false },
    );

    syncService.enqueue(
      "UPDATE_EXECUCAO",
      updatePayload,
    );

    if (orderStatus) {
      queueOrderStatus(
        params.farmId,
        params.ordemId,
        orderStatus,
      );
    }

    console.warn(
      "Atualização preservada localmente para sincronização.",
      error,
    );
  }
}

export async function pausarExecucaoOperacional(
  params: AtualizarExecucaoParams,
) {
  await updateExecution(params, {
    status: "pausada",
  });
}

export async function retomarExecucaoOperacional(
  params: AtualizarExecucaoParams,
) {
  await updateExecution(params, {
    status: "em_execucao",
  });
}

export async function finalizarExecucaoOperacional(
  params: FinalizarExecucaoParams,
) {
  await updateExecution(
    params,
    {
      status: "finalizada",
      dataFim: new Date(),
      rastreabilidadeStatus:
        "processando",
      consumoEstoqueStatus:
        "pendente_cobertura",
      ...(params.location
        ? {
            locationEnd:
              params.location,
          }
        : {}),
      ...(params.horimetroFinal !==
      undefined
        ? {
            horimetroFinal:
              params.horimetroFinal,
          }
        : {}),
    },
    "parcial",
  );

  syncService.enqueue(
    "RECONCILIAR_EXECUCAO_OPERACIONAL",
    {
      execucaoId:
        params.execucaoId,
      ordemId: params.ordemId,
      farmId: params.farmId,
      ...(params.location
        ? {
            locationEnd:
              params.location,
          }
        : {}),
      ...(params.horimetroFinal !==
      undefined
        ? {
            horimetroFinal:
              params.horimetroFinal,
          }
        : {}),
    },
  );
}
