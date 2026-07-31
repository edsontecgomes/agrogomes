import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import {
  cacheUEIs,
  getCachedUEIs,
} from "../../services/offlineReferenceStore";
import { UEIEspacial } from "./types";
import { validarUEIEspacial } from "./validarUEIEspacial";

export async function buscarUEIsDoTalhao(
  farmId: string,
  talhaoId: string,
): Promise<UEIEspacial[]> {
  if (!farmId || !talhaoId) {
    return [];
  }

  const cachedUEIs =
    getCachedUEIs(farmId, talhaoId);

  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return cachedUEIs;
  }

  const consulta = query(
    collection(db, "ueis"),
    where("farmId", "==", farmId),
    where("talhaoId", "==", talhaoId),
  );

  try {
    const snapshot = await getDocs(consulta);

    const ueis = snapshot.docs
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
          zonaTalhao: dados.zonaTalhao,
          status: dados.status,
        } as UEIEspacial;
      })
      .filter(
        (uei) =>
          validarUEIEspacial(uei).valida,
      );

    const outrasUEIs =
      getCachedUEIs(farmId).filter(
        (uei) => uei.talhaoId !== talhaoId,
      );

    cacheUEIs(
      farmId,
      [...outrasUEIs, ...ueis],
    );

    return ueis;
  } catch (error) {
    if (cachedUEIs.length > 0) {
      return cachedUEIs;
    }

    throw error;
  }
}
