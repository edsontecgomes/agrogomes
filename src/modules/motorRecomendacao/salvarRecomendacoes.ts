import {
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  ResultadoMotorRecomendacao,
} from "./types";

export async function salvarRecomendacoes(
  resultado: ResultadoMotorRecomendacao,
): Promise<string[]> {
  if (
    resultado.recomendacoes.length === 0
  ) {
    return [];
  }

  const batch = writeBatch(db);

  resultado.recomendacoes.forEach(
    (recomendacao) => {
      const referencia = doc(
        db,
        "recomendacoes_agronomicas",
        recomendacao.id,
      );

      batch.set(
        referencia,
        {
          ...recomendacao,

          processadoEm:
            resultado.processadoEm,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      );
    },
  );

  await batch.commit();

  return resultado.recomendacoes.map(
    (recomendacao) =>
      recomendacao.id,
  );
}