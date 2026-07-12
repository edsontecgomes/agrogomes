import {
  calcularPrimeiroQuartil,
  calcularTerceiroQuartil,
} from "./calcularQuantis";
import { AmostraEstatistica } from "./types";

export type ResultadoDeteccaoOutliers = {
  amostrasValidas: AmostraEstatistica[];

  outliers: AmostraEstatistica[];

  limiteInferior: number;

  limiteSuperior: number;

  intervaloInterquartil: number;
};

export function detectarOutliersIQR(
  amostras: AmostraEstatistica[],
  multiplicador = 1.5,
): ResultadoDeteccaoOutliers {
  const amostrasNumericas = amostras.filter(
    (amostra) =>
      Number.isFinite(amostra.valor),
  );

  if (amostrasNumericas.length < 4) {
    return {
      amostrasValidas: amostrasNumericas,
      outliers: [],
      limiteInferior: 0,
      limiteSuperior: 0,
      intervaloInterquartil: 0,
    };
  }

  const valores = amostrasNumericas.map(
    (amostra) => amostra.valor,
  );

  const primeiroQuartil =
    calcularPrimeiroQuartil(valores);

  const terceiroQuartil =
    calcularTerceiroQuartil(valores);

  const intervaloInterquartil =
    terceiroQuartil - primeiroQuartil;

  const limiteInferior =
    primeiroQuartil -
    multiplicador * intervaloInterquartil;

  const limiteSuperior =
    terceiroQuartil +
    multiplicador * intervaloInterquartil;

  const outliers =
    amostrasNumericas.filter(
      (amostra) =>
        amostra.valor < limiteInferior ||
        amostra.valor > limiteSuperior,
    );

  const idsOutliers = new Set(
    outliers.map(
      (amostra, indice) =>
        amostra.id ??
        `${amostra.fator}-${amostra.valor}-${indice}`,
    ),
  );

  const amostrasValidas =
    amostrasNumericas.filter(
      (amostra, indice) => {
        const id =
          amostra.id ??
          `${amostra.fator}-${amostra.valor}-${indice}`;

        return !idsOutliers.has(id);
      },
    );

  return {
    amostrasValidas,

    outliers,

    limiteInferior: Number(
      limiteInferior.toFixed(4),
    ),

    limiteSuperior: Number(
      limiteSuperior.toFixed(4),
    ),

    intervaloInterquartil: Number(
      intervaloInterquartil.toFixed(4),
    ),
  };
}