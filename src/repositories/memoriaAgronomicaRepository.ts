import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../services/firebase";
import { CicloAgronomico } from "../types/cicloAgronomico";
import { DecisaoAgronomica } from "../types/decisaoAgronomica";
import { EventoAgronomico } from "../types/eventoAgronomico";
import { ResultadoAgronomico } from "../types/resultadoAgronomico";

async function listarPorMemoriaAgronomica<T>(
  collectionName: string,
  memoriaAgronomicaId: string
): Promise<T[]> {
  const q = query(
    collection(db, collectionName),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as T[];
}

export async function carregarDadosMemoriaAgronomica(
  memoriaAgronomicaId: string
) {
  const [ciclos, decisoes, eventos, resultados] = await Promise.all([
    listarPorMemoriaAgronomica<CicloAgronomico>(
      "ciclosAgronomicos",
      memoriaAgronomicaId
    ),
    listarPorMemoriaAgronomica<DecisaoAgronomica>(
      "decisoesAgronomicas",
      memoriaAgronomicaId
    ),
    listarPorMemoriaAgronomica<EventoAgronomico>(
      "eventosAgronomicos",
      memoriaAgronomicaId
    ),
    listarPorMemoriaAgronomica<ResultadoAgronomico>(
      "resultadosAgronomicos",
      memoriaAgronomicaId
    ),
  ]);

  return {
    ciclos,
    decisoes,
    eventos,
    resultados,
  };
}