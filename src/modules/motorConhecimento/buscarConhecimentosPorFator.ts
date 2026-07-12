import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  ConhecimentoAgronomico,
} from "./types";

export async function buscarConhecimentosPorFator(
  farmId: string,
  fatorPrincipal: string,
): Promise<ConhecimentoAgronomico[]> {
  const consulta = query(
    collection(
      db,
      "conhecimentos_agronomicos",
    ),

    where(
      "farmId",
      "==",
      farmId,
    ),

    where(
      "fatorPrincipal",
      "==",
      fatorPrincipal,
    ),

    orderBy(
      "confiabilidade",
      "desc",
    ),
  );

  const snapshot =
    await getDocs(consulta);

  return snapshot.docs.map(
    (documento) => ({
      id:
        documento.id,

      ...documento.data(),
    }),
  ) as ConhecimentoAgronomico[];
}