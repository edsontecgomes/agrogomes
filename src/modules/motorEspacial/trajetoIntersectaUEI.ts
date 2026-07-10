import booleanIntersects from "@turf/boolean-intersects";
import { lineString } from "@turf/helpers";

import { converterUEIParaPoligonoTurf } from "./converterUEIParaPoligonoTurf";
import { normalizarTrajeto } from "./normalizarTrajeto";
import { pontoPertenceAUEI } from "./pontoPertenceAUEI";
import { UEIEspacial } from "./types";
import { PontoTrajetoEspacial } from "./typesTrajeto";

export function trajetoIntersectaUEI(
  trajetos: PontoTrajetoEspacial[],
  uei: UEIEspacial,
): boolean {
  const pontosNormalizados =
    normalizarTrajeto(trajetos);

  if (pontosNormalizados.length === 0) {
    return false;
  }

  if (pontosNormalizados.length === 1) {
    return pontoPertenceAUEI(
      pontosNormalizados[0],
      uei,
    );
  }

  const poligonoUEI =
    converterUEIParaPoligonoTurf(uei);

  if (!poligonoUEI) {
    return false;
  }

  const coordenadasLinha =
    pontosNormalizados.map((ponto) => [
      ponto.lng,
      ponto.lat,
    ]);

  try {
    const linha = lineString(coordenadasLinha);

    return booleanIntersects(
      linha,
      poligonoUEI,
    );
  } catch (error) {
    console.error(
      `Erro ao verificar interseção do trajeto com a UEI ${uei.id}:`,
      error,
    );

    return false;
  }
}