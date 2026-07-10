import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { EventoAgronomico } from "./types";

export async function buscarEventosFazenda(
  farmId: string,
  limite = 100,
): Promise<EventoAgronomico[]> {
  const consulta = query(
    collection(db, "eventos_agronomicos"),
    where("farmId", "==", farmId),
    orderBy("dataEvento", "desc"),
    limit(limite),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EventoAgronomico[];
}