import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { Uei } from "./types";

export async function salvarUEIFirestore(
  uei: Uei,
): Promise<string> {
  if (!uei.id) {
    throw new Error(
      "Não foi possível salvar a UEI: ID não informado.",
    );
  }

  if (!uei.producerId) {
    throw new Error(
      `Não foi possível salvar a UEI ${uei.id}: producerId não informado.`,
    );
  }

  if (!uei.farmId) {
    throw new Error(
      `Não foi possível salvar a UEI ${uei.id}: farmId não informado.`,
    );
  }

  if (!uei.talhaoId) {
    throw new Error(
      `Não foi possível salvar a UEI ${uei.id}: talhaoId não informado.`,
    );
  }

  if (
    !Number.isFinite(uei.areaHa) ||
    uei.areaHa <= 0
  ) {
    throw new Error(
      `Não foi possível salvar a UEI ${uei.id}: área inválida.`,
    );
  }

  const referencia = doc(
    db,
    "ueis",
    uei.id,
  );

  const snapshot = await getDoc(referencia);

  const payload: Record<string, unknown> = {
    ...uei,

    updatedAt: serverTimestamp(),
  };

  /**
   * A data de criação somente é registrada quando
   * a UEI ainda não existe.
   *
   * Em reprocessamentos, o createdAt original
   * permanece preservado.
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

  return uei.id;
}