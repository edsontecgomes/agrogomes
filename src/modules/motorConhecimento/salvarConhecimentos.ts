import {
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  ResultadoConsolidacaoConhecimento,
} from "./types";

export async function salvarConhecimentos(
  resultado: ResultadoConsolidacaoConhecimento,
): Promise<string[]> {
  if (
    resultado.conhecimentos.length === 0
  ) {
    return [];
  }

  const batch = writeBatch(db);

  resultado.conhecimentos.forEach(
    (conhecimento) => {
      const referencia = doc(
        db,
        "conhecimentos_agronomicos",
        conhecimento.id,
      );

      batch.set(
        referencia,
        {
          ...conhecimento,

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

  return resultado.conhecimentos.map(
    (conhecimento) =>
      conhecimento.id,
  );
}