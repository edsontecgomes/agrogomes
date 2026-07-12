import {
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { ResultadoMotorAprendizagem } from "./types";

export async function salvarAprendizados(
  resultado: ResultadoMotorAprendizagem,
): Promise<string[]> {
  if (
    resultado.aprendizados.length === 0
  ) {
    return [];
  }

  const batch = writeBatch(db);

  resultado.aprendizados.forEach(
    (aprendizado) => {
      const referencia = doc(
        db,
        "aprendizados_agronomicos",
        aprendizado.id,
      );

      batch.set(
        referencia,
        {
          ...aprendizado,

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

  return resultado.aprendizados.map(
    (aprendizado) =>
      aprendizado.id,
  );
}