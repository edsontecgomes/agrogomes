import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { RelacaoAgronomica } from "../types/relacaoAgronomica";

type CriarRelacaoAgronomicaInput = Omit<
  RelacaoAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarRelacaoAgronomica(
  payload: CriarRelacaoAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "relacoesAgronomicas"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarRelacoesPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<RelacaoAgronomica[]> {
  const q = query(
    collection(db, "relacoesAgronomicas"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RelacaoAgronomica[];
}

export async function listarRelacoesPorCiclo(
  cicloAgronomicoId: string
): Promise<RelacaoAgronomica[]> {
  const q = query(
    collection(db, "relacoesAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RelacaoAgronomica[];
}