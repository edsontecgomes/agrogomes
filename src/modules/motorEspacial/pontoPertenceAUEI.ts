import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

import { converterUEIParaPoligonoTurf } from "./converterUEIParaPoligonoTurf";
import { CoordenadaEspacial, UEIEspacial } from "./types";

export function pontoPertenceAUEI(
  localizacao: CoordenadaEspacial,
  uei: UEIEspacial,
): boolean {
  if (
    !Number.isFinite(localizacao.lat) ||
    !Number.isFinite(localizacao.lng)
  ) {
    return false;
  }

  const poligono = converterUEIParaPoligonoTurf(uei);

  if (!poligono) {
    return false;
  }

  try {
    const ponto = point([
      localizacao.lng,
      localizacao.lat,
    ]);

    return booleanPointInPolygon(ponto, poligono, {
      ignoreBoundary: false,
    });
  } catch (error) {
    console.error(
      `Erro ao verificar ponto na UEI ${uei.id}:`,
      error,
    );

    return false;
  }
}