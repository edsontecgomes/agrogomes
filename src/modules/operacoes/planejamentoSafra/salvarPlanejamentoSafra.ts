import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { PlanejamentoSafra } from "./types";

export async function salvarPlanejamentoSafra(
  planejamento: Omit<PlanejamentoSafra, "id" | "createdAt" | "updatedAt">,
) {
  const payload = {
    ...planejamento,
    status: planejamento.status ?? "planejada",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "planejamentos_safra"), payload);

  return {
    id: ref.id,
    ...payload,
  } as PlanejamentoSafra;
}