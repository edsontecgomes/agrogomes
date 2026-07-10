import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { EventoAgronomico, TipoEventoAgronomico } from "./types";

export async function buscarEventosPorTipo(
  farmId: string,
  tipo: TipoEventoAgronomico,
): Promise<EventoAgronomico[]> {
  const consulta = query(
    collection(db, "eventos_agronomicos"),
    where("farmId", "==", farmId),
    where("tipo", "==", tipo),
    orderBy("dataEvento", "desc"),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EventoAgronomico[];
}