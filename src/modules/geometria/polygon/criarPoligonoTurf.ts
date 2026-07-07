import { polygon } from "@turf/turf";
import type { Feature, Polygon } from "geojson";
import { CoordenadaGeografica } from "../centroide";

function fecharCoordenadas(coordenadas: CoordenadaGeografica[]): number[][] {
  const pontos = coordenadas.map((ponto) => [ponto.lng, ponto.lat]);

  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];

  const jaEstaFechado =
    primeiro[0] === ultimo[0] &&
    primeiro[1] === ultimo[1];

  if (!jaEstaFechado) {
    pontos.push(primeiro);
  }

  return pontos;
}

export function criarPoligonoTurf(
  coordenadas: CoordenadaGeografica[],
): Feature<Polygon> {
  if (!coordenadas || coordenadas.length < 3) {
    throw new Error("Não foi possível criar polígono: geometria inválida.");
  }

  const pontos = fecharCoordenadas(coordenadas);

  return polygon([pontos]);
}