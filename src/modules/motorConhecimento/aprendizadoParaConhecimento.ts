import type {
  AprendizadoAgronomico,
} from "../motorAprendizagem/types";

import {
  gerarChaveConhecimento,
  gerarIdConhecimento,
} from "./normalizarChaveConhecimento";
import type {
  ConhecimentoAgronomico,
} from "./types";

export function aprendizadoParaConhecimento(
  aprendizado: AprendizadoAgronomico,
): ConhecimentoAgronomico {
  const agora =
    new Date().toISOString();

  return {
    id: gerarIdConhecimento({
      entidadeId:
        aprendizado.entidadeId,

      fatorPrincipal:
        aprendizado.fatorPrincipal,
    }),

    chave: gerarChaveConhecimento({
      escopo:
        aprendizado.escopo,

      entidadeId:
        aprendizado.entidadeId,

      fatorPrincipal:
        aprendizado.fatorPrincipal,
    }),

    titulo:
      aprendizado.titulo,

    descricao:
      aprendizado.descricao,

    fatorPrincipal:
      aprendizado.fatorPrincipal,

    escopo:
      aprendizado.escopo,

    entidadeId:
      aprendizado.entidadeId,

    producerId:
      aprendizado.producerId,

    farmId:
      aprendizado.farmId,

    talhaoId:
      aprendizado.talhaoId,

    ueiId:
      aprendizado.ueiId,

    gdaId:
      aprendizado.gdaId,

    safraIds:
      aprendizado.safraId
        ? [aprendizado.safraId]
        : [],

    culturas:
      aprendizado.cultura
        ? [aprendizado.cultura]
        : [],

    origem:
      "aprendizado",

    status:
      aprendizado.status ===
      "contraditorio"
        ? "contraditorio"
        : "provisorio",

    maturidade:
      "inicial",

    aprendizadoIds: [
      aprendizado.id,
    ],

    evidencias: [
      ...aprendizado.evidencias,
    ],

    totalAprendizados:
      1,

    totalEvidenciasFavoraveis:
      aprendizado
        .totalEvidenciasFavoraveis,

    totalEvidenciasContrarias:
      aprendizado
        .totalEvidenciasContrarias,

    totalEventos:
      aprendizado.numeroEventos,

    totalSafras:
      aprendizado.numeroSafras,

    totalUEIs:
      aprendizado.numeroUEIs,

    forca:
      aprendizado.forca,

    confiabilidade:
      aprendizado.confiabilidade,

    estabilidade:
      0,

    indiceContradicao:
      aprendizado.evidencias.length > 0
        ? Number(
            (
              aprendizado
                .totalEvidenciasContrarias /
              aprendizado.evidencias.length
            ).toFixed(2),
          )
        : 0,

    criadoEm:
      aprendizado.criadoEm ??
      agora,

    atualizadoEm:
      agora,

    propriedades: {
      aprendizadoStatus:
        aprendizado.status,

      aprendizadoOrigem:
        aprendizado.origem,

      propriedadesAprendizado:
        aprendizado.propriedades,
    },
  };
}