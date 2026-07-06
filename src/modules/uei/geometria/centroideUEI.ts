import { CoordenadaGeometrica, PoligonoGeometrico } from "./tiposGeometriaUEI";

export function calcularCentroideUEI(
  geometria: PoligonoGeometrico,
): CoordenadaGeometrica {
  if (!geometria.length) {
    return { lat: 0, lng: 0 };
  }

  const soma = geometria.reduce(
    (acc, ponto) => ({
      lat: acc.lat + ponto.lat,
      lng: acc.lng + ponto.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: soma.lat / geometria.length,
    lng: soma.lng / geometria.length,
  };
}