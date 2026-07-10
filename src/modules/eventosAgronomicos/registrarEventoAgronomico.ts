import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { EventoAgronomico } from "./types";

export async function registrarEventoAgronomico(
  evento: Omit<EventoAgronomico, "id" | "createdAt" | "updatedAt">,
) {
  const payload = {
    ...evento,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "eventos_agronomicos"), payload);

  return {
    id: ref.id,
    ...payload,
  } as EventoAgronomico;
}