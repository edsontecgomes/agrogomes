import { calcularMedia } from "./calcularMedia";
import { CorrelacaoEstatistica } from "./types";

function classificarIntensidade(
  coeficiente: number,
): CorrelacaoEstatistica["intensidade"] {
  const absoluto = Math.abs(coeficiente);

  if (absoluto < 0.1) {
    return "inexistente";
  }

  if (absoluto < 0.3) {
    return "muito_fraca";
  }

  if (absoluto < 0.5) {
    return "fraca";
  }

  if (absoluto < 0.7) {
    return "moderada";
  }

  if (absoluto < 0.9) {
    return "forte";
  }

  return "muito_forte";
}

function calcularConfiabilidade(
  quantidade: number,
): number {
  if (quantidade < 3) {
    return 0.2;
  }

  if (quantidade < 5) {
    return 0.4;
  }

  if (quantidade < 10) {
    return 0.6;
  }

  if (quantidade < 20) {
    return 0.8;
  }

  return 1;
}

export function calcularCorrelacaoPearson(
  fatorX: string,
  valoresX: number[],
  fatorY: string,
  valoresY: number[],
): CorrelacaoEstatistica {
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
      coeficientePearson: 0,
      intensidade: "inexistente",
      direcao: "neutra",
      confiabilidade:
        calcularConfiabilidade(
          quantidade,
        ),
    };
  }

  const mediaX = calcularMedia(x);
  const mediaY = calcularMedia(y);

  let numerador = 0;
  let somaQuadradosX = 0;
  let somaQuadradosY = 0;

  for (
    let indice = 0;
    indice < quantidade;
    indice += 1
  ) {
    const desvioX =
      x[indice] - mediaX;

    const desvioY =
      y[indice] - mediaY;

    numerador += desvioX * desvioY;

    somaQuadradosX +=
      desvioX * desvioX;

    somaQuadradosY +=
      desvioY * desvioY;
  }

  const denominador = Math.sqrt(
    somaQuadradosX *
      somaQuadradosY,
  );

  const coeficiente =
    denominador === 0
      ? 0
      : numerador / denominador;

  return {
    fatorX,
    fatorY,

    quantidadePares:
      quantidade,

    coeficientePearson: Number(
      coeficiente.toFixed(4),
    ),

    intensidade:
      classificarIntensidade(
        coeficiente,
      ),

    direcao:
      coeficiente > 0
        ? "positiva"
        : coeficiente < 0
          ? "negativa"
          : "neutra",

    confiabilidade:
      calcularConfiabilidade(
        quantidade,
      ),
  };
}