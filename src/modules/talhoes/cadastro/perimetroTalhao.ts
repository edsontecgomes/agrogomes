import { CoordenadaCadastroTalhao } from "./talhaoCadastro";

function distanciaMetros(a: CoordenadaCadastroTalhao, b: CoordenadaCadastroTalhao) {
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

export function calcularPerimetroTalhao(
  coordenadas: CoordenadaCadastroTalhao[],
) {
  if (coordenadas.length < 2) return 0;

  return coordenadas.reduce((total, ponto, index) => {
    const proximo = coordenadas[(index + 1) % coordenadas.length];
    return total + distanciaMetros(ponto, proximo);
  }, 0);
}