import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { UEIEspacial } from "./types";
import { validarUEIEspacial } from "./validarUEIEspacial";

export async function buscarUEIsDoTalhao(
  farmId: string,
  talhaoId: string,
): Promise<UEIEspacial[]> {
  if (!farmId || !talhaoId) {
    return [];
  }

  const consulta = query(
    collection(db, "ueis"),
    where("farmId", "==", farmId),
    where("talhaoId", "==", talhaoId),
  );

  const snapshot = await getDocs(consulta);

  return snapshot.docs
    .map((documento) => {
      const dados = documento.data();

      return {
        id: documento.id,
        producerId: dados.producerId,
        farmId: dados.farmId,
        talhaoId: dados.talhaoId,
        codigo: dados.codigo,
        nome: dados.nome,
        numero: dados.numero,
        areaHa: Number(dados.areaHa ?? 0),
        geometria: Array.isArray(dados.geometria)
          ? dados.geometria
          : [],
        centroide: dados.centroide,
        origem: dados.origem,
        status: dados.status,
      } as UEIEspacial;
    })
    .filter((uei) => validarUEIEspacial(uei).valida);
}