import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { ChuvaAgronomica } from "../types/chuvaAgronomica";

type CriarChuvaAgronomicaInput = Omit<
  ChuvaAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarChuvaAgronomica(
  payload: CriarChuvaAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "chuvasAgronomicas"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarChuvasPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<ChuvaAgronomica[]> {
  const q = query(
    collection(db, "chuvasAgronomicas"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChuvaAgronomica[];
}

export async function listarChuvasPorCiclo(
  cicloAgronomicoId: string
): Promise<ChuvaAgronomica[]> {
  const q = query(
    collection(db, "chuvasAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ChuvaAgronomica[];
}