import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { GDA } from "./types";

export async function salvarGDAFirestore(
  gda: GDA,
): Promise<string> {
  if (!gda.id) {
    throw new Error(
      "Não foi possível salvar o GDA: ID não informado.",
    );
  }

  if (!gda.ueiId) {
    throw new Error(
      `Não foi possível salvar o GDA ${gda.id}: ueiId não informado.`,
    );
  }

  if (!gda.farmId) {
    throw new Error(
      `Não foi possível salvar o GDA ${gda.id}: farmId não informado.`,
    );
  }

  if (!gda.talhaoId) {
    throw new Error(
      `Não foi possível salvar o GDA ${gda.id}: talhaoId não informado.`,
    );
  }

  const referencia = doc(
    db,
    "gdas",
    gda.id,
  );

  const snapshot = await getDoc(referencia);

  const payload: Record<string, unknown> = {
    ...gda,

    updatedAt: serverTimestamp(),
  };

  /**
   * Preserva a data original de criação do GDA
   * durante reprocessamentos do talhão ou da UEI.
   */
  if (!snapshot.exists()) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(
    referencia,
    payload,
    {
      merge: true,
    },
  );

  return gda.id;
}

export async function buscarGDAPorId(
  gdaId: string,
): Promise<GDA | null> {
  if (!gdaId) {
    return null;
  }

  const referencia = doc(
    db,
    "gdas",
    gdaId,
  );

  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,

    ...snapshot.data(),
  } as GDA;
}

export async function garantirGDAFirestore(
  gda: GDA,
): Promise<string> {
  const existente = await buscarGDAPorId(
    gda.id,
  );

  if (existente) {
    return existente.id;
  }

  return salvarGDAFirestore(gda);
}