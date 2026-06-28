import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { RecomendacaoAgronomica } from "../types/recomendacaoAgronomica";

type CriarRecomendacaoAgronomicaInput = Omit<
  RecomendacaoAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarRecomendacaoAgronomica(
  payload: CriarRecomendacaoAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "recomendacoesAgronomicas"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarRecomendacoesPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<RecomendacaoAgronomica[]> {
  const q = query(
    collection(db, "recomendacoesAgronomicas"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RecomendacaoAgronomica[];
}

export async function listarRecomendacoesPorCiclo(
  cicloAgronomicoId: string
): Promise<RecomendacaoAgronomica[]> {
  const q = query(
    collection(db, "recomendacoesAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RecomendacaoAgronomica[];
}