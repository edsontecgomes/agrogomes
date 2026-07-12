import { ResultadoEstatisticoEventos } from "../motorEstatistico/processarEventosAgronomicos";

import { EvidenciaAprendizado } from "./types";

export function extrairEvidenciasEstatisticas(
  resultado: ResultadoEstatisticoEventos,
  fatorPrincipal: string,
): EvidenciaAprendizado[] {
  const analises =
    resultado.resultados.filter(
      (item) =>
        item.fatorPrincipal ===
        fatorPrincipal,
    );

  const evidencias: EvidenciaAprendizado[] = [];

  analises.forEach(
    (analise, indice) => {
      evidencias.push({
        id: [
          "EAP-ESTATISTICA",
          fatorPrincipal,
          String(indice + 1).padStart(
            3,
            "0",
          ),
        ].join("-"),

        tipo:
          "estatistica",

        descricao:
          `O fator ${fatorPrincipal} possui ` +
          `${analise.resumo.quantidade} amostra(s), ` +
          `média ${analise.resumo.media} e ` +
          `coeficiente de variação ` +
          `${analise.resumo.coeficienteVariacao}%.`,

        favoravel:
          analise.resumo.quantidade > 0 &&
          analise.confiabilidadeGeral >= 0.4,

        peso:
          Math.max(
            0.5,
            analise.confiabilidadeGeral,
          ),

        confiabilidade:
          analise.confiabilidadeGeral,

        criadaEm:
          analise.processadoEm.toISOString(),
      });

      analise.correlacoes.forEach(
        (correlacao, correlacaoIndice) => {
          evidencias.push({
            id: [
              "EAP-CORRELACAO",
              fatorPrincipal,
              correlacao.fatorY,
              String(
                correlacaoIndice + 1,
              ).padStart(3, "0"),
            ].join("-"),

            tipo:
              "estatistica",

            descricao:
              `Correlação ${correlacao.direcao} ` +
              `${correlacao.intensidade} entre ` +
              `${correlacao.fatorX} e ` +
              `${correlacao.fatorY}.`,

            favoravel:
              Math.abs(
                correlacao.coeficientePearson,
              ) >= 0.3,

            peso:
              Math.max(
                0.5,
                Math.abs(
                  correlacao.coeficientePearson,
                ),
              ),

            confiabilidade:
              correlacao.confiabilidade,

            criadaEm:
              analise.processadoEm.toISOString(),
          });
        },
      );
    },
  );

  return evidencias;
}