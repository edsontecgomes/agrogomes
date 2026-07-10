import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { TimelineAgronomicaItem } from "./types";

export async function salvarTimelineItem(
  item: Omit<TimelineAgronomicaItem, "id" | "createdAt" | "updatedAt">,
) {
  const payload = {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "timeline_agronomica"), payload);

  return {
    id: ref.id,
    ...payload,
  } as TimelineAgronomicaItem;
}