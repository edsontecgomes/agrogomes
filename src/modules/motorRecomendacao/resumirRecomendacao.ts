import type {
  RecomendacaoAgronomica,
} from "./types";

export type ResumoRecomendacao = {
  recomendacaoId: string;

  titulo: string;

  pontuacaoFinal: number;

  prioridade: string;

  risco: string;

  confiabilidadePercentual: number;

  ganhoEstimadoScHa?: number;

  principalJustificativa?: string;

  possuiImpedimento: boolean;
};

export function resumirRecomendacao(
  recomendacao: RecomendacaoAgronomica,
): ResumoRecomendacao {
  return {
    recomendacaoId:
      recomendacao.id,

    titulo:
      recomendacao.titulo,

    pontuacaoFinal:
      recomendacao.pontuacaoFinal,

    prioridade:
      recomendacao.prioridade,

    risco:
      recomendacao.risco,

    confiabilidadePercentual:
      Number(
        (
          recomendacao.confiabilidade *
          100
        ).toFixed(2),
      ),

    ganhoEstimadoScHa:
      recomendacao.beneficio
        ?.ganhoEstimadoScHa,

    principalJustificativa:
      recomendacao
        .justificativas[0],

    possuiImpedimento:
      recomendacao.riscos.some(
        (risco) =>
          risco.impeditivo,
      ),
  };
}