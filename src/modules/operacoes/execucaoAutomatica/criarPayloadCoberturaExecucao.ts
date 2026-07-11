import { resumirCoberturaOperacional } from "../../motorEspacial/resumirCoberturaOperacional";
import { ResultadoCoberturaOperacional } from "../../motorEspacial/typesCobertura";

export function criarPayloadCoberturaExecucao(
  resultado: ResultadoCoberturaOperacional,
): Record<string, unknown> {
  return {
    metodo: resultado.metodo,

    larguraOperacionalMetros:
      resultado.larguraOperacionalMetros,

    totalPontosTrajeto:
      resultado.totalPontosTrajeto,

    totalUEIsAtingidas:
      resultado.totalUEIsAtingidas,

    areaTotalCobertaHa:
      resultado.areaTotalCobertaHa,

    percentualMedioCobertura:
      resultado.percentualMedioCobertura,

    confiabilidade:
      resultado.confiabilidade,

    ueiIds:
      resultado.ueiIds,

    coberturas:
      resultado.coberturas,

    resumo:
      resumirCoberturaOperacional(
        resultado,
      ),

    observacoes:
      resultado.observacoes,
  };
}