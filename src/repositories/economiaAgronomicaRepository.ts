import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { RegistroEconomicoAgronomico } from "../types/economiaAgronomica";

type CriarRegistroEconomicoInput = Omit<
  RegistroEconomicoAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarRegistroEconomicoAgronomico(
  payload: CriarRegistroEconomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "registrosEconomicosAgronomicos"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarRegistrosEconomicosPorCiclo(
  cicloAgronomicoId: string
): Promise<RegistroEconomicoAgronomico[]> {
  const q = query(
    collection(db, "registrosEconomicosAgronomicos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RegistroEconomicoAgronomico[];
}

export async function listarRegistrosEconomicosPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<RegistroEconomicoAgronomico[]> {
  const q = query(
    collection(db, "registrosEconomicosAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as RegistroEconomicoAgronomico[];
}