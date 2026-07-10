import { polygon } from "@turf/helpers";
import type { Feature, Polygon } from "geojson";

import { normalizarPoligono } from "./normalizarPoligono";
import { UEIEspacial } from "./types";

export function converterUEIParaPoligonoTurf(
  uei: UEIEspacial,
): Feature<Polygon> | null {
  const geometriaNormalizada = normalizarPoligono(uei.geometria);

  if (geometriaNormalizada.length < 4) {
    return null;
  }

  const coordenadas = geometriaNormalizada.map(
    (coordenada) => [coordenada.lng, coordenada.lat],
  );

  try {
    return polygon([coordenadas]);
  } catch (error) {
    console.error(
      `Erro ao converter a UEI ${uei.id} para polígono Turf:`,
      error,
    );

    return null;
  }
}