import { ResultadoMotorCientificoCompleto } from "../ciencia/typesMotorCientifico";
import { ResultadoEstatisticoEventos } from "../motorEstatistico/processarEventosAgronomicos";

import { criarAprendizadoAgronomico } from "./criarAprendizadoAgronomico";
import { extrairEvidenciasCientificas } from "./extrairEvidenciasCientificas";
import { extrairEvidenciasEstatisticas } from "./extrairEvidenciasEstatisticas";
import {
  AprendizadoAgronomico,
  ResultadoMotorAprendizagem,
} from "./types";

type ProcessarMotorAprendizagemParams = {
  resultadoCientifico:
    ResultadoMotorCientificoCompleto;

  resultadoEstatistico?:
    ResultadoEstatisticoEventos;

  producerId?: string;

  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraId?: string;

  cultura?: string;
};

export function processarMotorAprendizagem({
  resultadoCientifico,
  resultadoEstatistico,
  producerId,
  farmId,
  talhaoId,
  ueiId,
  gdaId,
  safraId,
  cultura,
}: ProcessarMotorAprendizagemParams): ResultadoMotorAprendizagem {
  const evidenciasCientificas =
    extrairEvidenciasCientificas(
      resultadoCientifico,
    );

  const fatores = Array.from(
    new Set(
      resultadoCientifico.fatores.map(
        (fator) => fator.chave,
      ),
    ),
  );

  const entidadeId =
    gdaId ??
    ueiId ??
    talhaoId ??
    farmId;

  const aprendizados:
    AprendizadoAgronomico[] =
    fatores.map((fator) => {
      const evidenciasEstatisticas =
        resultadoEstatistico
          ? extrairEvidenciasEstatisticas(
              resultadoEstatistico,
              fator,
            )
          : [];

      const evidenciasDoFator =
        evidenciasCientificas.filter(
          (evidencia) =>
            evidencia.origemId?.includes(
              fator,
            ) ||
            evidencia.descricao
              .toLowerCase()
              .includes(
                fator.toLowerCase(),
              ),
        );

      const evidencias = [
        ...evidenciasDoFator,
        ...evidenciasEstatisticas,
      ];

      return criarAprendizadoAgronomico({
        chave:
          `${entidadeId}:${fator}`,

        titulo:
          `Aprendizado sobre ${fator}`,

        descricao:
          `Conhecimento consolidado sobre o fator ${fator}.`,

        fatorPrincipal:
          fator,

        escopo:
          gdaId
            ? "gda"
            : ueiId
              ? "uei"
              : talhaoId
                ? "talhao"
                : "fazenda",

        entidadeId,

        producerId,

        farmId,

        talhaoId,

        ueiId,

        gdaId,

        safraId,

        cultura,

        origem:
          "consolidacao",

        evidencias,

        numeroEventos:
          resultadoEstatistico
            ?.totalEventos ??
          1,

        numeroSafras:
          safraId
            ? 1
            : 0,

        numeroUEIs:
          ueiId
            ? 1
            : resultadoCientifico
                .eventoCientifico
                .ueiIds?.length ?? 0,

        propriedades: {
          eventoAgronomicoId:
            resultadoCientifico
              .eventoAgronomicoId,
        },
      });
    });

  const confiabilidadeMedia =
    aprendizados.length > 0
      ? aprendizados.reduce(
          (total, aprendizado) =>
            total +
            aprendizado.confiabilidade,
          0,
        ) / aprendizados.length
      : 0;

  return {
    aprendizados,

    totalAprendizados:
      aprendizados.length,

    totalConsistentes:
      aprendizados.filter(
        (aprendizado) =>
          aprendizado.status ===
          "consistente",
      ).length,

    totalFortes:
      aprendizados.filter(
        (aprendizado) =>
          aprendizado.status ===
          "forte",
      ).length,

    totalContraditorios:
      aprendizados.filter(
        (aprendizado) =>
          aprendizado.status ===
          "contraditorio",
      ).length,

    confiabilidadeMedia: Number(
      confiabilidadeMedia.toFixed(2),
    ),

    processadoEm:
      new Date().toISOString(),
  };
}