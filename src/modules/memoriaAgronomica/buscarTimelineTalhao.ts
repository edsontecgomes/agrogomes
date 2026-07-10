import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { TimelineAgronomicaItem } from "./types";

export async function buscarTimelineTalhao(
  farmId: string,
  talhaoId: string,
): Promise<TimelineAgronomicaItem[]> {
  const consulta = query(
    collection(db, "timeline_agronomica"),
    where("farmId", "==", farmId),
    where("talhaoId", "==", talhaoId),
    orderBy("dataEvento", "desc"),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TimelineAgronomicaItem[];
}