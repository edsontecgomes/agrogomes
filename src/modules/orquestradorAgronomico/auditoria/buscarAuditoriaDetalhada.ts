import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../../../services/firebase";

import { normalizarAuditoriaDetalhada } from "./normalizarProcessamentoAuditoria";

import type {
  AuditoriaProcessamentoDetalhada,
} from "./typesPainelAuditoria";

export async function buscarAuditoriaDetalhada(
  processamentoId: string,
): Promise<
  AuditoriaProcessamentoDetalhada | null
> {
  if (!processamentoId) {
    return null;
  }

  const referencia = doc(
    db,
    "auditorias_processamento_agronomico",
    processamentoId,
  );

  const snapshot =
    await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return normalizarAuditoriaDetalhada(
    snapshot.id,
    snapshot.data(),
  );
}