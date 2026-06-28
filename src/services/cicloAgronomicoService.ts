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
  CicloAgronomico,
  StatusCicloAgronomico,
} from "../types/cicloAgronomico";

type CriarCicloAgronomicoInput = Omit<
  CicloAgronomico,
  "id" | "createdAt" | "updatedAt" | "status" | "ativo"
>;

export async function criarCicloAgronomico(
  payload: CriarCicloAgronomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "ciclosAgronomicos"), {
    ...payload,
    status: "planejamento",
    ativo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarCicloAgronomicoPorId(
  id: string
): Promise<CicloAgronomico | null> {
  const ref = doc(db, "ciclosAgronomicos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as CicloAgronomico;
}

export async function listarCiclosPorTalhao(
  talhaoId: string
): Promise<CicloAgronomico[]> {
  const q = query(
    collection(db, "ciclosAgronomicos"),
    where("talhaoId", "==", talhaoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as CicloAgronomico[];
}

export async function listarCiclosPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<CicloAgronomico[]> {
  const q = query(
    collection(db, "ciclosAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as CicloAgronomico[];
}

export async function atualizarStatusCicloAgronomico(
  id: string,
  status: StatusCicloAgronomico
): Promise<void> {
  const ref = doc(db, "ciclosAgronomicos", id);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function encerrarCicloAgronomico(params: {
  id: string;
  status: StatusCicloAgronomico;
  encerradoPor: string;
  motivoEncerramento?: string;
}): Promise<void> {
  const ref = doc(db, "ciclosAgronomicos", params.id);

  await updateDoc(ref, {
    status: params.status,
    ativo: false,
    encerradoPor: params.encerradoPor,
    motivoEncerramento: params.motivoEncerramento ?? "",
    encerradoEm: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}