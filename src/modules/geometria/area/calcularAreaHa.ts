import { area } from "@turf/turf";
import { CoordenadaGeografica } from "../centroide";
import { criarPoligonoTurf } from "../polygon";

export function calcularAreaHa(
  coordenadas: CoordenadaGeografica[],
): number {
  const poligono = criarPoligonoTurf(coordenadas);

  const areaM2 = area(poligono);

  return Number((areaM2 / 10_000).toFixed(4));
}