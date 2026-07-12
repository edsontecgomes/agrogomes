import { normalizarValores } from "./normalizarValores";

export function calcularQuantil(
  valores: unknown[],
  percentil: number,
): number {
  const ordenados = normalizarValores(valores).sort(
    (a, b) => a - b,
  );

  if (ordenados.length === 0) {
    return 0;
  }

  const percentilLimitado = Math.min(
    1,
    Math.max(0, percentil),
  );

  const indice =
    (ordenados.length - 1) *
    percentilLimitado;

  const inferior = Math.floor(indice);
  const superior = Math.ceil(indice);

  if (inferior === superior) {
    return ordenados[inferior];
  }

  const proporcao = indice - inferior;

  return (
    ordenados[inferior] +
    (
      ordenados[superior] -
      ordenados[inferior]
    ) *
      proporcao
  );
}

export function calcularMediana(
  valores: unknown[],
): number {
  return calcularQuantil(valores, 0.5);
}

export function calcularPrimeiroQuartil(
  valores: unknown[],
): number {
  return calcularQuantil(valores, 0.25);
}

export function calcularTerceiroQuartil(
  valores: unknown[],
): number {
  return calcularQuantil(valores, 0.75);
}