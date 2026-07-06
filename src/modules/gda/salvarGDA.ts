import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../services/firebase";
import { GDA } from "./GDA";
import { MemoriaAgronomicaGDA } from "./memoriaAgronomica";

export async function salvarGDAComMemoria(
  gda: GDA,
  memoria: MemoriaAgronomicaGDA,
) {
  const batch = writeBatch(db);

  batch.set(doc(collection(db, "gdas"), gda.id), {
    ...gda,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  batch.set(doc(collection(db, "memorias_agronomicas"), memoria.id), {
    ...memoria,
    ultimaAtualizacao: serverTimestamp(),
  });

  await batch.commit();

  return { gda, memoria };
}