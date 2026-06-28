import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { AprendizadoAgronomico } from "../types/aprendizadoAgronomico";

type CriarAprendizadoAgronomicoInput = Omit<
  AprendizadoAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarAprendizadoAgronomico(
  payload: CriarAprendizadoAgronomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "aprendizadosAgronomicos"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarAprendizadosPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<AprendizadoAgronomico[]> {
  const q = query(
    collection(db, "aprendizadosAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AprendizadoAgronomico[];
}

export async function listarAprendizadosPorCiclo(
  cicloAgronomicoId: string
): Promise<AprendizadoAgronomico[]> {
  const q = query(
    collection(db, "aprendizadosAgronomicos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AprendizadoAgronomico[];
}