import type { Feature, Polygon } from "geojson";
import { CoordenadaGeografica } from "../centroide";

export function converterPoligonoParaCoordenadas(
  poligono: Feature<Polygon>,
): CoordenadaGeografica[] {
  return poligono.geometry.coordinates[0].map(([lng, lat]) => ({
    lat,
    lng,
  }));
}