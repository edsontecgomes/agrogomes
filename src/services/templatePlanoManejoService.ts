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
  TemplatePlanoManejo,
  StatusTemplatePlanoManejo,
} from "../types/templatePlanoManejo";

type CriarTemplatePlanoManejoInput = Omit<
  TemplatePlanoManejo,
  "id" | "createdAt" | "updatedAt" | "status"
>;

export async function criarTemplatePlanoManejo(
  payload: CriarTemplatePlanoManejoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "templatesPlanoManejo"), {
    ...payload,
    status: "ativo",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarTemplatePlanoManejoPorId(
  id: string
): Promise<TemplatePlanoManejo | null> {
  const ref = doc(db, "templatesPlanoManejo", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as TemplatePlanoManejo;
}

export async function listarTemplatesPlanoManejoPorProdutor(
  producerId: string
): Promise<TemplatePlanoManejo[]> {
  const q = query(
    collection(db, "templatesPlanoManejo"),
    where("producerId", "==", producerId),
    where("status", "==", "ativo")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TemplatePlanoManejo[];
}

export async function listarTemplatesPlanoManejoPorCultura(
  producerId: string,
  cultura: string
): Promise<TemplatePlanoManejo[]> {
  const q = query(
    collection(db, "templatesPlanoManejo"),
    where("producerId", "==", producerId),
    where("cultura", "==", cultura),
    where("status", "==", "ativo")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TemplatePlanoManejo[];
}

export async function atualizarStatusTemplatePlanoManejo(
  id: string,
  status: StatusTemplatePlanoManejo
): Promise<void> {
  const ref = doc(db, "templatesPlanoManejo", id);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}