import {
  addDoc,
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
import {
  EtapaPlanoManejo,
  PlanoManejo,
  StatusPlanoManejo,
} from "../types/planoManejo";

type CriarPlanoManejoInput = Omit<
  PlanoManejo,
  "id" | "createdAt" | "updatedAt" | "status"
>;

export async function criarPlanoManejo(
  payload: CriarPlanoManejoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "planosManejo"), {
    ...payload,
    status: "rascunho",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarPlanoManejoPorId(
  id: string
): Promise<PlanoManejo | null> {
  const ref = doc(db, "planosManejo", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as PlanoManejo;
}

export async function listarPlanosPorCiclo(
  cicloAgronomicoId: string
): Promise<PlanoManejo[]> {
  const q = query(
    collection(db, "planosManejo"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PlanoManejo[];
}

export async function listarPlanosPorTalhao(
  talhaoId: string
): Promise<PlanoManejo[]> {
  const q = query(
    collection(db, "planosManejo"),
    where("talhaoId", "==", talhaoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PlanoManejo[];
}

export async function atualizarStatusPlanoManejo(
  id: string,
  status: StatusPlanoManejo
): Promise<void> {
  const ref = doc(db, "planosManejo", id);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function atualizarEtapasPlanoManejo(
  id: string,
  etapas: EtapaPlanoManejo[]
): Promise<void> {
  const ref = doc(db, "planosManejo", id);

  await updateDoc(ref, {
    etapas,
    updatedAt: serverTimestamp(),
  });
}