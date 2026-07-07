import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../../services/firebase";
import { Uei } from "./types";

export async function salvarUEIFirestore(
  uei: Uei,
) {
  const referencia = doc(db, "ueis", uei.id);

  await setDoc(
    referencia,
    {
      ...uei,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  return uei.id;
}