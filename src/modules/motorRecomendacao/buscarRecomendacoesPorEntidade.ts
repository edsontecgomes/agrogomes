import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import type {
  RecomendacaoAgronomica,
} from "./types";

export async function buscarRecomendacoesPorEntidade(
  farmId: string,
  campoEntidade:
    | "gdaId"
    | "ueiId"
    | "talhaoId",
  entidadeId: string,
): Promise<RecomendacaoAgronomica[]> {
  const consulta = query(
    collection(
      db,
      "recomendacoes_agronomicas",
    ),

    where(
      "farmId",
      "==",
      farmId,
    ),

    where(
      campoEntidade,
      "==",
      entidadeId,
    ),

    orderBy(
      "pontuacaoFinal",
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
  ) as RecomendacaoAgronomica[];
}