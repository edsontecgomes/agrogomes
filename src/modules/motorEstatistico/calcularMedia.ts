import { normalizarValores } from "./normalizarValores";

export function calcularSoma(
  valores: unknown[],
): number {
  return normalizarValores(valores).reduce(
    (total, valor) => total + valor,
    0,
  );
}

export function calcularMedia(
  valores: unknown[],
): number {
  const validos = normalizarValores(valores);

  if (validos.length === 0) {
    return 0;
  }

  return calcularSoma(validos) / validos.length;
}