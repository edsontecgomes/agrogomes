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
import {
  DecisaoAgronomica,
  StatusDecisaoAgronomica,
} from "../types/decisaoAgronomica";

type CriarDecisaoAgronomicaInput = Omit<
  DecisaoAgronomica,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "eventosRelacionados"
  | "resultadosRelacionados"
>;

export async function criarDecisaoAgronomica(
  payload: CriarDecisaoAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "decisoesAgronomicas"), {
    ...payload,
    status: "proposta",
    eventosRelacionados: [],
    resultadosRelacionados: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarDecisaoAgronomicaPorId(
  id: string
): Promise<DecisaoAgronomica | null> {
  const ref = doc(db, "decisoesAgronomicas", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as DecisaoAgronomica;
}

export async function listarDecisoesPorCiclo(
  cicloAgronomicoId: string
): Promise<DecisaoAgronomica[]> {
  const q = query(
    collection(db, "decisoesAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as DecisaoAgronomica[];
}

export async function listarDecisoesPorPlano(
  planoManejoId: string
): Promise<DecisaoAgronomica[]> {
  const q = query(
    collection(db, "decisoesAgronomicas"),
    where("planoManejoId", "==", planoManejoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as DecisaoAgronomica[];
}

export async function atualizarStatusDecisaoAgronomica(
  id: string,
  status: StatusDecisaoAgronomica
): Promise<void> {
  const ref = doc(db, "decisoesAgronomicas", id);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function vincularEventoNaDecisaoAgronomica(
  decisaoAgronomicaId: string,
  eventoAgronomicoId: string
): Promise<void> {
  const ref = doc(db, "decisoesAgronomicas", decisaoAgronomicaId);

  await updateDoc(ref, {
    eventosRelacionados: arrayUnion(eventoAgronomicoId),
    updatedAt: serverTimestamp(),
  });
}

export async function vincularResultadoNaDecisaoAgronomica(
  decisaoAgronomicaId: string,
  resultadoId: string
): Promise<void> {
  const ref = doc(db, "decisoesAgronomicas", decisaoAgronomicaId);

  await updateDoc(ref, {
    resultadosRelacionados: arrayUnion(resultadoId),
    updatedAt: serverTimestamp(),
  });
}