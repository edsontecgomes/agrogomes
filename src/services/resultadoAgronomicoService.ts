import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { ResultadoAgronomico } from "../types/resultadoAgronomico";

type CriarResultadoAgronomicoInput = Omit<
  ResultadoAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarResultadoAgronomico(
  payload: CriarResultadoAgronomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "resultadosAgronomicos"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarResultadoAgronomicoPorId(
  id: string
): Promise<ResultadoAgronomico | null> {
  const ref = doc(db, "resultadosAgronomicos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as ResultadoAgronomico;
}

export async function listarResultadosPorCiclo(
  cicloAgronomicoId: string
): Promise<ResultadoAgronomico[]> {
  const q = query(
    collection(db, "resultadosAgronomicos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ResultadoAgronomico[];
}

export async function listarResultadosPorDecisao(
  decisaoAgronomicaId: string
): Promise<ResultadoAgronomico[]> {
  const q = query(
    collection(db, "resultadosAgronomicos"),
    where("decisaoAgronomicaId", "==", decisaoAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ResultadoAgronomico[];
}

export async function listarResultadosPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<ResultadoAgronomico[]> {
  const q = query(
    collection(db, "resultadosAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ResultadoAgronomico[];
}