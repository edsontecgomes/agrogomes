import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { TimelineAgronomicaItem } from "./types";

export async function buscarTimelineFazenda(
  farmId: string,
  limite = 50,
): Promise<TimelineAgronomicaItem[]> {
  const consulta = query(
    collection(db, "timeline_agronomica"),
    where("farmId", "==", farmId),
    orderBy("dataEvento", "desc"),
    limit(limite),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TimelineAgronomicaItem[];
}