import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { EventoAgronomico } from "../types/eventoAgronomico";

type CriarEventoAgronomicoInput = Omit<
  EventoAgronomico,
  "id" | "createdAt" | "updatedAt"
>;

export async function registrarEventoAgronomico(
  payload: CriarEventoAgronomicoInput
): Promise<string> {
  const ref = await addDoc(collection(db, "eventosAgronomicos"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function buscarEventoAgronomicoPorId(
  id: string
): Promise<EventoAgronomico | null> {
  const ref = doc(db, "eventosAgronomicos", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as EventoAgronomico;
}

export async function listarEventosPorCiclo(
  cicloAgronomicoId: string
): Promise<EventoAgronomico[]> {
  const q = query(
    collection(db, "eventosAgronomicos"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId),
    orderBy("dataEvento", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as EventoAgronomico[];
}

export async function listarEventosPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<EventoAgronomico[]> {
  const q = query(
    collection(db, "eventosAgronomicos"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId),
    orderBy("dataEvento", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as EventoAgronomico[];
}

export async function listarEventosPorTalhao(
  talhaoId: string
): Promise<EventoAgronomico[]> {
  const q = query(
    collection(db, "eventosAgronomicos"),
    where("talhaoId", "==", talhaoId),
    orderBy("dataEvento", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as EventoAgronomico[];
}