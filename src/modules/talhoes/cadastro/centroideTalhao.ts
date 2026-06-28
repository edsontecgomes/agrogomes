import { CoordenadaCadastroTalhao } from "./talhaoCadastro";

export function calcularCentroideTalhao(
  coordenadas: CoordenadaCadastroTalhao[],
): CoordenadaCadastroTalhao | undefined {
  if (!coordenadas.length) return undefined;

  const soma = coordenadas.reduce(
    (acc, ponto) => ({
      lat: acc.lat + ponto.lat,
      lng: acc.lng + ponto.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: soma.lat / coordenadas.length,
    lng: soma.lng / coordenadas.length,
  };
}