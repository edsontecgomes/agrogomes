import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { MemoriaAgronomica } from "../types/memoriaAgronomica";

type CriarMemoriaAgronomicaInput = Omit<
  MemoriaAgronomica,
  "id" | "createdAt" | "updatedAt" | "status" | "historicoCiclos"
>;

export async function criarMemoriaAgronomica(
  payload: CriarMemoriaAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "memoriasAgronomicas"), {
    ...payload,
    status: "ativa",
    historicoCiclos: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarMemoriaAgronomicaPorId(
  id: string
): Promise<MemoriaAgronomica | null> {
  const ref = doc(db, "memoriasAgronomicas", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as MemoriaAgronomica;
}

export async function listarMemoriasPorTalhao(
  talhaoId: string
): Promise<MemoriaAgronomica[]> {
  const q = query(
    collection(db, "memoriasAgronomicas"),
    where("talhaoId", "==", talhaoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as MemoriaAgronomica[];
}

export async function vincularCicloNaMemoriaAgronomica(
  memoriaAgronomicaId: string,
  cicloAgronomicoId: string
): Promise<void> {
  const ref = doc(db, "memoriasAgronomicas", memoriaAgronomicaId);

  await updateDoc(ref, {
    historicoCiclos: arrayUnion(cicloAgronomicoId),
    updatedAt: serverTimestamp(),
  });
}