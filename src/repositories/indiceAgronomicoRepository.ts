import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { IndiceAgronomico } from "../types/indiceAgronomico";

type CriarIndiceAgronomicoInput = Omit<
  IndiceAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarIndiceAgronomico(
  payload: CriarIndiceAgronomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "indicesAgronomicos"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarIndicesPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<IndiceAgronomico[]> {
  const q = query(
    collection(db, "indicesAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as IndiceAgronomico[];
}

export async function listarIndicesPorCiclo(
  cicloAgronomicoId: string
): Promise<IndiceAgronomico[]> {
  const q = query(
    collection(db, "indicesAgronomicos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as IndiceAgronomico[];
}