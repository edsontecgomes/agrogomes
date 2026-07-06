import { PoligonoGeometrico } from "./tiposGeometriaUEI";

export function calcularAreaAproximadaUEI(
  geometria: PoligonoGeometrico,
): number {
  if (geometria.length < 3) return 0;

  const metrosPorGrauLat = 111_320;
  const latMedia =
    geometria.reduce((soma, p) => soma + p.lat, 0) / geometria.length;
  const metrosPorGrauLng = metrosPorGrauLat * Math.cos((latMedia * Math.PI) / 180);

  let areaM2 = 0;

  for (let i = 0; i < geometria.length; i += 1) {
    const atual = geometria[i];
    const proximo = geometria[(i + 1) % geometria.length];

    const x1 = atual.lng * metrosPorGrauLng;
    const y1 = atual.lat * metrosPorGrauLat;
    const x2 = proximo.lng * metrosPorGrauLng;
    const y2 = proximo.lat * metrosPorGrauLat;

    areaM2 += x1 * y2 - x2 * y1;
  }

  return Math.abs(areaM2 / 2) / 10_000;
}