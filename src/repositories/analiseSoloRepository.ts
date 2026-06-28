import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { AnaliseSolo } from "../types/analiseSolo";

type CriarAnaliseSoloInput = Omit<
  AnaliseSolo,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarAnaliseSolo(
  payload: CriarAnaliseSoloInput
): Promise<string> {
  const ref = await addDoc(collection(db, "analisesSolo"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarAnalisesSoloPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<AnaliseSolo[]> {
  const q = query(
    collection(db, "analisesSolo"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as AnaliseSolo[];
}