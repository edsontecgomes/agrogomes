import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  StatusRecomendacao,
} from "./types";

export async function atualizarStatusRecomendacao(
  recomendacaoId: string,
  status: StatusRecomendacao,
  responsavelId?: string,
  observacao?: string,
): Promise<void> {
  const referencia = doc(
    db,
    "recomendacoes_agronomicas",
    recomendacaoId,
  );

  await updateDoc(
    referencia,
    {
      status,

      ultimaDecisao: {
        status,

        responsavelId:
          responsavelId ?? null,

        observacao:
          observacao ?? null,

        data:
          new Date().toISOString(),
      },

      updatedAt:
        serverTimestamp(),
    },
  );
}