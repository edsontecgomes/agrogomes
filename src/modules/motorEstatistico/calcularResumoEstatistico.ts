import { calcularCoeficienteVariacao, calcularDesvioPadrao, calcularVariancia } from "./calcularDispersao";
import { calcularMedia, calcularSoma } from "./calcularMedia";
import { calcularMediana, calcularPrimeiroQuartil, calcularTerceiroQuartil } from "./calcularQuantis";
import { normalizarValores } from "./normalizarValores";
import { ResumoEstatistico } from "./types";

export function calcularResumoEstatistico(
  valores: unknown[],
): ResumoEstatistico {
  const validos = normalizarValores(valores);

  if (validos.length === 0) {
    return {
      quantidade: 0,
      soma: 0,
      minimo: 0,
      maximo: 0,
      amplitude: 0,
      media: 0,
      mediana: 0,
      primeiroQuartil: 0,
      terceiroQuartil: 0,
      variancia: 0,
      desvioPadrao: 0,
      coeficienteVariacao: 0,
    };
  }

  const minimo = Math.min(...validos);
  const maximo = Math.max(...validos);

  return {
    quantidade: validos.length,

    soma: Number(
      calcularSoma(validos).toFixed(4),
    ),

    minimo: Number(minimo.toFixed(4)),

    maximo: Number(maximo.toFixed(4)),

    amplitude: Number(
      (maximo - minimo).toFixed(4),
    ),

    media: Number(
      calcularMedia(validos).toFixed(4),
    ),

    mediana: Number(
      calcularMediana(validos).toFixed(4),
    ),

    primeiroQuartil: Number(
      calcularPrimeiroQuartil(
        validos,
      ).toFixed(4),
    ),

    terceiroQuartil: Number(
      calcularTerceiroQuartil(
        validos,
      ).toFixed(4),
    ),

    variancia: Number(
      calcularVariancia(validos).toFixed(4),
    ),

    desvioPadrao: Number(
      calcularDesvioPadrao(
        validos,
      ).toFixed(4),
    ),

    coeficienteVariacao: Number(
      calcularCoeficienteVariacao(
        validos,
      ).toFixed(2),
    ),
  };
}