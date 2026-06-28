import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { ProdutividadeAgronomica } from "../types/produtividadeAgronomica";

type CriarProdutividadeAgronomicaInput = Omit<
  ProdutividadeAgronomica,
  "id" | "createdAt" | "updatedAt"
>;

export async function salvarProdutividadeAgronomica(
  payload: CriarProdutividadeAgronomicaInput
): Promise<string> {
  const ref = await addDoc(collection(db, "produtividadesAgronomicas"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listarProdutividadesPorCiclo(
  cicloAgronomicoId: string
): Promise<ProdutividadeAgronomica[]> {
  const q = query(
    collection(db, "produtividadesAgronomicas"),
    where("cicloAgronomicoId", "==", cicloAgronomicoId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ProdutividadeAgronomica[];
}

export async function listarProdutividadesPorMemoriaAgronomica(
  memoriaAgronomicaId: string
): Promise<ProdutividadeAgronomica[]> {
  const q = query(
    collection(db, "produtividadesAgronomicas"),
    where("memoriaAgronomicaId", "==", memoriaAgronomicaId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as ProdutividadeAgronomica[];
}