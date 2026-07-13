import type {
  BeneficioRecomendacao,
} from "./types";

type CalcularBeneficioParams = {
  ganhoEstimadoScHa?: number;

  ganhoEstimadoPercentual?: number;

  economiaEstimadaPorHa?: number;

  areaBeneficiadaHa?: number;

  percentualAreaBeneficiada?: number;

  descricao?: string;
};

export function calcularBeneficioRecomendacao(
  params: CalcularBeneficioParams,
): BeneficioRecomendacao {
  const ganhoScHa =
    params.ganhoEstimadoScHa ?? 0;

  const ganhoPercentual =
    params.ganhoEstimadoPercentual ??
    0;

  const economia =
    params.economiaEstimadaPorHa ??
    0;

  const areaPercentual =
    params.percentualAreaBeneficiada ??
    0;

  const fatorProdutividade = Math.min(
    1,
    Math.max(
      0,
      ganhoScHa / 10,
    ),
  );

  const fatorPercentual = Math.min(
    1,
    Math.max(
      0,
      ganhoPercentual / 15,
    ),
  );

  const fatorEconomia = Math.min(
    1,
    Math.max(
      0,
      economia / 300,
    ),
  );

  const fatorArea = Math.min(
    1,
    Math.max(
      0,
      areaPercentual / 100,
    ),
  );

  const pontuacao =
    fatorProdutividade * 35 +
    fatorPercentual * 25 +
    fatorEconomia * 20 +
    fatorArea * 20;

  return {
    ganhoEstimadoScHa:
      params.ganhoEstimadoScHa,

    ganhoEstimadoPercentual:
      params.ganhoEstimadoPercentual,

    economiaEstimadaPorHa:
      params.economiaEstimadaPorHa,

    areaBeneficiadaHa:
      params.areaBeneficiadaHa,

    percentualAreaBeneficiada:
      params.percentualAreaBeneficiada,

    pontuacaoBeneficio: Number(
      Math.min(
        100,
        pontuacao,
      ).toFixed(2),
    ),

    descricao:
      params.descricao ??
      "Benefício agronômico estimado com base no conhecimento disponível.",
  };
}