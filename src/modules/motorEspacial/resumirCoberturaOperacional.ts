import { ResultadoCoberturaOperacional } from "./typesCobertura";

export type ResumoCoberturaOperacional = {
  totalUEIsAtingidas: number;

  areaTotalCobertaHa: number;

  percentualMedioCobertura: number;

  ueiMaisCobertaId?: string;

  maiorPercentualCobertura?: number;

  ueiMenosCobertaId?: string;

  menorPercentualCobertura?: number;
};

export function resumirCoberturaOperacional(
  resultado: ResultadoCoberturaOperacional,
): ResumoCoberturaOperacional {
  const coberturasOrdenadas = [
    ...resultado.coberturas,
  ].sort(
    (primeira, segunda) =>
      segunda.percentualCobertura -
      primeira.percentualCobertura,
  );

  const maior =
    coberturasOrdenadas[0];

  const menor =
    coberturasOrdenadas[
      coberturasOrdenadas.length - 1
    ];

  return {
    totalUEIsAtingidas:
      resultado.totalUEIsAtingidas,

    areaTotalCobertaHa:
      resultado.areaTotalCobertaHa,

    percentualMedioCobertura:
      resultado.percentualMedioCobertura,

    ueiMaisCobertaId:
      maior?.ueiId,

    maiorPercentualCobertura:
      maior?.percentualCobertura,

    ueiMenosCobertaId:
      menor?.ueiId,

    menorPercentualCobertura:
      menor?.percentualCobertura,
  };
}