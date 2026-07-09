import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { OrdemProgramada } from "./types";

export async function salvarOrdensProgramadas(ordens: OrdemProgramada[]) {
  await Promise.all(
    ordens.map((ordem) =>
      setDoc(
        doc(db, "ordens_programadas", ordem.id),
        {
          ...ordem,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );

  return ordens;
}