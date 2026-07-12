import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { criarIndiceConhecimentoGDA } from "./criarIndiceConhecimentoGDA";
import type {
  ConhecimentoAgronomico,
} from "./types";

export async function atualizarGDAComConhecimento(
  gdaId: string,
  conhecimentos: ConhecimentoAgronomico[],
): Promise<void> {
  const referencia = doc(
    db,
    "gdas",
    gdaId,
  );

  const snapshot =
    await getDoc(referencia);

  if (!snapshot.exists()) {
    return;
  }

  const indice =
    criarIndiceConhecimentoGDA(
      gdaId,
      conhecimentos,
    );

  await setDoc(
    referencia,
    {
      indiceConhecimento:
        indice.indiceConhecimento,

      totalConhecimentos:
        indice.totalConhecimentos,

      totalConhecimentosMaduros:
        indice.totalMaduros,

      totalConhecimentosContraditorios:
        indice.totalContraditorios,

      confiabilidadeConhecimento:
        indice.confiabilidadeMedia,

      estabilidadeConhecimento:
        indice.estabilidadeMedia,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}