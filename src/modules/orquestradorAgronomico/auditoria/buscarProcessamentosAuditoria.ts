import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../services/firebase";

import { normalizarProcessamentoAuditoria } from "./normalizarProcessamentoAuditoria";

import type {
  FiltroPainelAuditoria,
  ProcessamentoAuditoriaResumo,
} from "./typesPainelAuditoria";

function obterDataOrdenacao(
  processamento:
    ProcessamentoAuditoriaResumo,
): number {
  const valor =
    processamento.atualizadoEm ??
    processamento.finalizadoEm ??
    processamento.iniciadoEm;

  if (!valor) {
    return 0;
  }

  const timestamp =
    Date.parse(valor);

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

export async function buscarProcessamentosAuditoria({
  farmId,
  status,
  tipoEvento,
  talhaoId,
  limite = 100,
}: FiltroPainelAuditoria): Promise<
  ProcessamentoAuditoriaResumo[]
> {
  if (!farmId) {
    return [];
  }

  const consulta = query(
    collection(
      db,
      "processamentos_agronomicos",
    ),

    where(
      "farmId",
      "==",
      farmId,
    ),

    limit(
      Math.max(
        1,
        Math.min(
          300,
          limite,
        ),
      ),
    ),
  );

  const snapshot =
    await getDocs(consulta);

  return snapshot.docs
    .map((documento) =>
      normalizarProcessamentoAuditoria(
        documento.id,
        documento.data(),
      ),
    )
    .filter(
      (processamento) =>
        !status ||
        processamento.status ===
          status,
    )
    .filter(
      (processamento) =>
        !tipoEvento ||
        processamento.tipoEvento ===
          tipoEvento,
    )
    .filter(
      (processamento) =>
        !talhaoId ||
        processamento.talhaoId ===
          talhaoId,
    )
    .sort(
      (primeiro, segundo) =>
        obterDataOrdenacao(
          segundo,
        ) -
        obterDataOrdenacao(
          primeiro,
        ),
    );
}