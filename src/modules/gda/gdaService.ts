import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../../services/firebase";
import { GDA } from "./types";

export async function salvarGDAFirestore(gda: GDA) {
  const referencia = doc(db, "gdas", gda.id);

  await setDoc(
    referencia,
    {
      ...gda,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return gda.id;
}

export async function buscarGDAPorId(gdaId: string): Promise<GDA | null> {
  const referencia = doc(db, "gdas", gdaId);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as GDA;
}

export async function garantirGDAFirestore(gda: GDA) {
  const existente = await buscarGDAPorId(gda.id);

  if (existente) {
    return existente.id;
  }

  return salvarGDAFirestore(gda);
}