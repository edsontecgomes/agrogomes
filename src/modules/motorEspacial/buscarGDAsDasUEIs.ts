import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { gerarIdGDAEspacial } from "./gerarIdGDAEspacial";
import { GDAEspacial } from "./typesGDA";

export async function buscarGDAsDasUEIs(
  ueiIds: string[],
): Promise<GDAEspacial[]> {
  const idsUnicos = Array.from(
    new Set(
      ueiIds
        .map((ueiId) => ueiId.trim())
        .filter(Boolean),
    ),
  );

  if (idsUnicos.length === 0) {
    return [];
  }

  const resultados = await Promise.all(
    idsUnicos.map(async (ueiId) => {
      const gdaId = gerarIdGDAEspacial(ueiId);

      const referencia = doc(
        db,
        "gdas",
        gdaId,
      );

      const snapshot = await getDoc(referencia);

      if (!snapshot.exists()) {
        return null;
      }

      const dados = snapshot.data();

      return {
        id: snapshot.id,
        ueiId: dados.ueiId ?? ueiId,
        farmId: dados.farmId ?? "",
        talhaoId: dados.talhaoId ?? "",
        status: dados.status,
        indiceMaturidadeCientifica:
          dados.indiceMaturidadeCientifica,
        indiceConfiabilidade:
          dados.indiceConfiabilidade,
        totalEventos: dados.totalEventos,
        totalSafras: dados.totalSafras,
      } as GDAEspacial;
    }),
  );

  return resultados.filter(
    (gda): gda is GDAEspacial => gda !== null,
  );
}