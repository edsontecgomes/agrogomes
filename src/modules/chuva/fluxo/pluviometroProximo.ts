export type CoordenadaChuva = {
  lat: number;
  lng: number;
};

export type PluviometroResumo = {
  id: string;
  nome: string;
  lat: number;
  lng: number;
};

export function calcularDistanciaMetros(a: CoordenadaChuva, b: CoordenadaChuva) {
  const raioTerra = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * raioTerra * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function encontrarPluviometroMaisProximo(
  atual: CoordenadaChuva,
  pluviometros: PluviometroResumo[],
  raioMetros: number,
) {
  const encontrados = pluviometros
    .map((p) => ({
      ...p,
      distanciaMetros: calcularDistanciaMetros(atual, {
        lat: p.lat,
        lng: p.lng,
      }),
    }))
    .filter((p) => p.distanciaMetros <= raioMetros)
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);

  return encontrados[0] || null;
}