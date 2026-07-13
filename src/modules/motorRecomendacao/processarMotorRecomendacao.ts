import { construirRecomendacao } from "./construirRecomendacao";
import { gerarAlternativasManejo } from "./gerarAlternativasManejo";
import { ordenarRecomendacoes } from "./ordenarRecomendacoes";
import type {
  ContextoRecomendacao,
  ResultadoMotorRecomendacao,
} from "./types";

export function processarMotorRecomendacao(
  contexto: ContextoRecomendacao,
): ResultadoMotorRecomendacao {
  const alternativas =
    gerarAlternativasManejo(
      contexto,
    );

  const recomendacoes =
    ordenarRecomendacoes(
      alternativas.map(
        (alternativa) =>
          construirRecomendacao(
            alternativa,
            contexto,
          ),
      ),
    );

  const recomendacoesValidas =
    recomendacoes.filter(
      (recomendacao) =>
        recomendacao.status !==
          "rascunho" &&
        recomendacao.pontuacaoFinal >
          0,
    );

  const confiabilidadeMedia =
    recomendacoes.length > 0
      ? recomendacoes.reduce(
          (total, recomendacao) =>
            total +
            recomendacao.confiabilidade,
          0,
        ) / recomendacoes.length
      : 0;

  return {
    recomendacoes,

    totalAlternativas:
      alternativas.length,

    totalRecomendacoes:
      recomendacoesValidas.length,

    totalImpedidas:
      recomendacoes.filter(
        (recomendacao) =>
          recomendacao.status ===
          "rascunho",
      ).length,

    recomendacaoPrincipal:
      recomendacoesValidas[0],

    confiabilidadeMedia: Number(
      confiabilidadeMedia.toFixed(2),
    ),

    processadoEm:
      new Date().toISOString(),
  };
}