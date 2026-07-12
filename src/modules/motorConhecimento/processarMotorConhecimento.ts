import type {
  AprendizadoAgronomico,
} from "../motorAprendizagem/types";

import { aprendizadoParaConhecimento } from "./aprendizadoParaConhecimento";
import { atualizarIndicadoresConhecimento } from "./atualizarIndicadoresConhecimento";
import { consolidarConhecimentos } from "./consolidarConhecimentos";
import type {
  ResultadoConsolidacaoConhecimento,
} from "./types";

export function processarMotorConhecimento(
  aprendizados: AprendizadoAgronomico[],
): ResultadoConsolidacaoConhecimento {
  const conhecimentosIniciais =
    aprendizados.map(
      aprendizadoParaConhecimento,
    );

  const consolidados =
    consolidarConhecimentos(
      conhecimentosIniciais,
    ).map(
      atualizarIndicadoresConhecimento,
    );

  const confiabilidadeMedia =
    consolidados.length > 0
      ? consolidados.reduce(
          (total, conhecimento) =>
            total +
            conhecimento.confiabilidade,
          0,
        ) / consolidados.length
      : 0;

  return {
    conhecimentos:
      consolidados,

    totalRecebidos:
      conhecimentosIniciais.length,

    totalConsolidados:
      consolidados.length,

    totalDuplicadosRemovidos:
      Math.max(
        0,
        conhecimentosIniciais.length -
          consolidados.length,
      ),

    totalMaduros:
      consolidados.filter(
        (conhecimento) =>
          conhecimento.status ===
          "maduro",
      ).length,

    totalContraditorios:
      consolidados.filter(
        (conhecimento) =>
          conhecimento.status ===
          "contraditorio",
      ).length,

    confiabilidadeMedia: Number(
      confiabilidadeMedia.toFixed(2),
    ),

    processadoEm:
      new Date().toISOString(),
  };
}