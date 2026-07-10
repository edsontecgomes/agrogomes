import { CoordenadaEspacial, PoligonoEspacial } from "./types";

function coordenadasIguais(
  primeira: CoordenadaEspacial,
  segunda: CoordenadaEspacial,
): boolean {
  return (
    primeira.lat === segunda.lat &&
    primeira.lng === segunda.lng
  );
}

export function normalizarPoligono(
  geometria: PoligonoEspacial,
): PoligonoEspacial {
  if (!Array.isArray(geometria) || geometria.length < 3) {
    return [];
  }

  const coordenadasValidas = geometria.filter(
    (coordenada) =>
      Number.isFinite(coordenada.lat) &&
      Number.isFinite(coordenada.lng),
  );

  if (coordenadasValidas.length < 3) {
    return [];
  }

  const primeira = coordenadasValidas[0];
  const ultima = coordenadasValidas[coordenadasValidas.length - 1];

  if (coordenadasIguais(primeira, ultima)) {
    return coordenadasValidas;
  }

  return [
    ...coordenadasValidas,
    {
      lat: primeira.lat,
      lng: primeira.lng,
    },
  ];
}