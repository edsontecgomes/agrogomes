import { ResultadoMotorCientificoCompleto } from "../ciencia/typesMotorCientifico";

import { EvidenciaAprendizado } from "./types";

function converterConfiabilidade(
  valor: string,
): number {
  switch (valor) {
    case "muito_alto":
      return 1;

    case "alto":
      return 0.85;

    case "medio":
      return 0.65;

    case "baixo":
      return 0.4;

    default:
      return 0.2;
  }
}

export function extrairEvidenciasCientificas(
  resultado: ResultadoMotorCientificoCompleto,
): EvidenciaAprendizado[] {
  const evidencias: EvidenciaAprendizado[] = [];

  resultado.hipoteses.forEach(
    (hipotese, indice) => {
      evidencias.push({
        id: [
          "EAP-CIENTIFICA",
          hipotese.id,
          String(indice + 1).padStart(
            3,
            "0",
          ),
        ].join("-"),

        origemId:
          hipotese.id,

        tipo:
          "hipotese",

        descricao:
          hipotese.descricao,

        favoravel:
          hipotese.status !== "rejeitada",

        peso:
          hipotese.status === "validada"
            ? 1.5
            : 1,

        confiabilidade:
          converterConfiabilidade(
            hipotese.confiabilidade,
          ),

        criadaEm:
          hipotese.criadaEm.toISOString(),
      });
    },
  );

  resultado.descobertas.forEach(
    (item, indice) => {
      const descoberta =
        item as {
          descoberta?: {
            id?: string;
            descricao?: string;
            confiabilidade?: string;
          };
          significativa?: boolean;
        };

      evidencias.push({
        id: [
          "EAP-DESCOBERTA",
          descoberta.descoberta?.id ??
            String(indice + 1),
        ].join("-"),

        origemId:
          descoberta.descoberta?.id,

        tipo:
          "descoberta",

        descricao:
          descoberta.descoberta
            ?.descricao ??
          "Descoberta científica identificada.",

        favoravel:
          descoberta.significativa !== false,

        peso:
          descoberta.significativa
            ? 1.5
            : 0.7,

        confiabilidade:
          converterConfiabilidade(
            descoberta.descoberta
              ?.confiabilidade ??
              "baixo",
          ),

        criadaEm:
          new Date().toISOString(),
      });
    },
  );

  return evidencias;
}