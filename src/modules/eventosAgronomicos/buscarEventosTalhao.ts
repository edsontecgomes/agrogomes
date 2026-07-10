import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { EventoAgronomico } from "./types";

export async function buscarEventosTalhao(
  farmId: string,
  talhaoId: string,
): Promise<EventoAgronomico[]> {
  const consulta = query(
    collection(db, "eventos_agronomicos"),
    where("farmId", "==", farmId),
    where("talhaoId", "==", talhaoId),
    orderBy("dataEvento", "desc"),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EventoAgronomico[];
}