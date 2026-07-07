import * as turf from "@turf/turf";

export type CoordenadaGeografica = {
  lat: number;
  lng: number;
};

function fecharPoligono(coordenadas: CoordenadaGeografica[]): number[][] {
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

export function calcularCentroide(
  coordenadas: CoordenadaGeografica[],
): CoordenadaGeografica {
  if (!coordenadas || coordenadas.length < 3) {
    throw new Error("Não foi possível calcular centroide: polígono inválido.");
  }

  const pontos = fecharPoligono(coordenadas);

  const poligono = turf.polygon([pontos]);

  const centroide = turf.centroid(poligono);

  const [lng, lat] = centroide.geometry.coordinates;

  return {
    lat,
    lng,
  };
}