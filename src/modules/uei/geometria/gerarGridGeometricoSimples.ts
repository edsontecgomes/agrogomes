import { PoligonoGeometrico } from "./tiposGeometriaUEI";

export function obterLimitesPoligono(poligono: PoligonoGeometrico) {
  return {
    minLat: Math.min(...poligono.map((p) => p.lat)),
    maxLat: Math.max(...poligono.map((p) => p.lat)),
    minLng: Math.min(...poligono.map((p) => p.lng)),
    maxLng: Math.max(...poligono.map((p) => p.lng)),
  };
}

export function gerarGridGeometricoSimples(
  poligonoTalhao: PoligonoGeometrico,
): PoligonoGeometrico[] {
  if (poligonoTalhao.length < 3) return [];

  const limites = obterLimitesPoligono(poligonoTalhao);
  const ladoAproximadoGraus = 0.0009;
  const celulas: PoligonoGeometrico[] = [];

  for (
    let lat = limites.minLat;
    lat < limites.maxLat;
    lat += ladoAproximadoGraus
  ) {
    for (
      let lng = limites.minLng;
      lng < limites.maxLng;
      lng += ladoAproximadoGraus
    ) {
      celulas.push([
        { lat, lng },
        { lat, lng: lng + ladoAproximadoGraus },
        { lat: lat + ladoAproximadoGraus, lng: lng + ladoAproximadoGraus },
        { lat: lat + ladoAproximadoGraus, lng },
      ]);
    }
  }

  return celulas;
}