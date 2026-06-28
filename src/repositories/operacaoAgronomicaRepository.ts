import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { OperacaoAgronomica } from "../types/operacaoAgronomica";

type CriarOperacaoAgronomicaInput = Omit<
  OperacaoAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarOperacaoAgronomica(
  payload: CriarOperacaoAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "operacoesAgronomicas"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarOperacoesPorCiclo(
  cicloAgronomicoId: string
): Promise<OperacaoAgronomica[]> {
  const q = query(
    collection(db, "operacoesAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as OperacaoAgronomica[];
}

export async function listarOperacoesPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<OperacaoAgronomica[]> {
  const q = query(
    collection(db, "operacoesAgronomicas"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as OperacaoAgronomica[];
}