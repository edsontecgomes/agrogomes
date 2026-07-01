import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { UEI } from "./UEI";

export async function salvarUEIs(lista: UEI[]) {

  if (!lista.length) return;

  const batch = writeBatch(db);

  lista.forEach((uei) => {

    const ref = doc(collection(db, "ueis"), uei.id);

    batch.set(ref, {

      ...uei,

      criadoEm: serverTimestamp(),

      atualizadoEm: serverTimestamp(),

    });

  });

  await batch.commit();

}