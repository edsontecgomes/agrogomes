import type {
  ConhecimentoAgronomico,
} from "../motorConhecimento/types";

import { calcularBeneficioRecomendacao } from "./calcularBeneficioRecomendacao";
import { criarCriterioRecomendacao } from "./criarCriterioRecomendacao";
import { criarRiscoRecomendacao } from "./criarRiscoRecomendacao";
import type {
  AlternativaManejo,
  TipoRecomendacaoAgronomica,
} from "./types";

function identificarTipo(
  fator: string,
): TipoRecomendacaoAgronomica {
  const normalizado =
    fator.toLowerCase();

  if (
    normalizado.includes(
      "cultivar",
    )
  ) {
    return "cultivar";
  }

  if (
    normalizado.includes(
      "populacao",
    )
  ) {
    return "populacao_plantas";
  }

  if (
    normalizado.includes(
      "adub",
    )
  ) {
    return "adubacao";
  }

  if (
    normalizado.includes(
      "plantio",
    )
  ) {
    return "janela_plantio";
  }

  if (
    normalizado.includes(
      "solo",
    )
  ) {
    return "correcao_solo";
  }

  if (
    normalizado.includes(
      "operacao",
    )
  ) {
    return "operacao";
  }

  return "manejo";
}

export function conhecimentoParaAlternativa(
  conhecimento: ConhecimentoAgronomico,
): AlternativaManejo {
  const contraditorio =
    conhecimento.status ===
    "contraditorio";

  const conhecimentoForte =
    conhecimento.forca >= 60 &&
    conhecimento.confiabilidade >=
      0.6;

  const criterio =
    criarCriterioRecomendacao({
      id:
        `CRIT-${conhecimento.id}`,

      nome:
        "Força do conhecimento",

      descricao:
        `Conhecimento com força ${conhecimento.forca} ` +
        `e confiabilidade ${conhecimento.confiabilidade}.`,

      peso:
        1,

      atendido:
        conhecimentoForte,

      valorObservado: {
        forca:
          conhecimento.forca,

        confiabilidade:
          conhecimento.confiabilidade,

        estabilidade:
          conhecimento.estabilidade,
      },

      valorEsperado: {
        forcaMinima:
          60,

        confiabilidadeMinima:
          0.6,
      },

      conhecimentoId:
        conhecimento.id,
    });

  const riscos = contraditorio
    ? [
        criarRiscoRecomendacao({
          id:
            `RISCO-${conhecimento.id}`,

          nome:
            "Conhecimento contraditório",

          descricao:
            "Existem evidências relevantes em sentidos opostos.",

          probabilidade:
            Math.max(
              0.3,
              conhecimento.indiceContradicao,
            ),

          impacto:
            0.8,

          impeditivo:
            true,

          conhecimentoId:
            conhecimento.id,
        }),
      ]
    : [];

  const beneficio =
    calcularBeneficioRecomendacao({
      ganhoEstimadoScHa:
        typeof conhecimento
          .propriedades
          ?.ganhoEstimadoScHa ===
        "number"
          ? conhecimento
              .propriedades
              .ganhoEstimadoScHa
          : undefined,

      ganhoEstimadoPercentual:
        typeof conhecimento
          .propriedades
          ?.ganhoEstimadoPercentual ===
        "number"
          ? conhecimento
              .propriedades
              .ganhoEstimadoPercentual
          : undefined,

      percentualAreaBeneficiada:
        conhecimento.totalUEIs > 0
          ? Math.min(
              100,
              conhecimento.totalUEIs *
                5,
            )
          : undefined,

      descricao:
        conhecimento.descricao,
    });

  return {
    id:
      `ALT-${conhecimento.id}`,

    tipo:
      identificarTipo(
        conhecimento.fatorPrincipal,
      ),

    titulo:
      conhecimento.titulo,

    descricao:
      conhecimento.descricao,

    valorProposto:
      conhecimento.propriedades
        ?.valorRecomendado,

    unidade:
      typeof conhecimento
        .propriedades
        ?.unidade === "string"
        ? conhecimento
            .propriedades
            .unidade
        : undefined,

    caminho:
      contraditorio
        ? "investigar"
        : conhecimentoForte
          ? "ajuste_incremental"
          : "investigar",

    criterios: [
      criterio,
    ],

    riscos,

    beneficio,

    conhecimentoIds: [
      conhecimento.id,
    ],

    propriedades: {
      maturidade:
        conhecimento.maturidade,

      statusConhecimento:
        conhecimento.status,
    },
  };
}