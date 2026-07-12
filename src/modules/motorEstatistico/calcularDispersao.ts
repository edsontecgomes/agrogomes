import { calcularMedia } from "./calcularMedia";
import { normalizarValores } from "./normalizarValores";

export function calcularVariancia(
  valores: unknown[],
  amostral = true,
): number {
  const validos = normalizarValores(valores);

  if (
    validos.length === 0 ||
    (
      amostral &&
      validos.length < 2
    )
  ) {
    return 0;
  }

  const media = calcularMedia(validos);

  const somaQuadrados = validos.reduce(
    (total, valor) =>
      total +
      Math.pow(valor - media, 2),
    0,
  );

  const divisor = amostral
    ? validos.length - 1
    : validos.length;

  return somaQuadrados / divisor;
}

export function calcularDesvioPadrao(
  valores: unknown[],
  amostral = true,
): number {
  return Math.sqrt(
    calcularVariancia(
      valores,
      amostral,
    ),
  );
}

export function calcularCoeficienteVariacao(
  valores: unknown[],
): number {
  const media = calcularMedia(valores);

  if (media === 0) {
    return 0;
  }

  const desvioPadrao =
    calcularDesvioPadrao(valores);

  return Math.abs(
    (desvioPadrao / media) * 100,
  );
}