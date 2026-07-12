import { calcularCorrelacaoPearson } from "./calcularCorrelacaoPearson";
import { calcularMedia } from "./calcularMedia";
import { RegressaoLinear } from "./types";

export function calcularRegressaoLinear(
  fatorX: string,
  valoresX: number[],
  fatorY: string,
  valoresY: number[],
): RegressaoLinear {
  const quantidade = Math.min(
    valoresX.length,
    valoresY.length,
  );

  const x = valoresX.slice(0, quantidade);
  const y = valoresY.slice(0, quantidade);

  if (quantidade < 2) {
    return {
      fatorX,
      fatorY,
      quantidadePares: quantidade,
      inclinacao: 0,
      intercepto: 0,
      rQuadrado: 0,
      confiabilidade: 0,
    };
  }

  const mediaX = calcularMedia(x);
  const mediaY = calcularMedia(y);

  let numerador = 0;
  let denominador = 0;

  for (
    let indice = 0;
    indice < quantidade;
    indice += 1
  ) {
    const desvioX =
      x[indice] - mediaX;

    numerador +=
      desvioX *
      (y[indice] - mediaY);

    denominador +=
      desvioX * desvioX;
  }

  const inclinacao =
    denominador === 0
      ? 0
      : numerador / denominador;

  const intercepto =
    mediaY -
    inclinacao * mediaX;

  const correlacao =
    calcularCorrelacaoPearson(
      fatorX,
      x,
      fatorY,
      y,
    );

  return {
    fatorX,
    fatorY,

    quantidadePares:
      quantidade,

    inclinacao: Number(
      inclinacao.toFixed(6),
    ),

    intercepto: Number(
      intercepto.toFixed(6),
    ),

    rQuadrado: Number(
      Math.pow(
        correlacao.coeficientePearson,
        2,
      ).toFixed(4),
    ),

    confiabilidade:
      correlacao.confiabilidade,
  };
}