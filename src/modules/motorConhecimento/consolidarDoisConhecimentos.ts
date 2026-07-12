import { calcularConfiabilidadeConhecimento } from "./calcularConfiabilidadeConhecimento";
import { calcularEstabilidadeConhecimento } from "./calcularEstabilidadeConhecimento";
import { calcularForcaConhecimento } from "./calcularForcaConhecimento";
import {
  calcularMaturidadeConhecimento,
  definirStatusConhecimento,
} from "./calcularMaturidadeConhecimento";
import { deduplicarEvidencias } from "./deduplicarEvidencias";
import type {
  ConhecimentoAgronomico,
} from "./types";

function unirStrings(
  primeira: string[],
  segunda: string[],
): string[] {
  return Array.from(
    new Set([
      ...primeira,
      ...segunda,
    ]),
  );
}

export function consolidarDoisConhecimentos(
  atual: ConhecimentoAgronomico,
  novo: ConhecimentoAgronomico,
): ConhecimentoAgronomico {
  const evidencias =
    deduplicarEvidencias([
      ...atual.evidencias,
      ...novo.evidencias,
    ]);

  const totalFavoraveis =
    evidencias.filter(
      (evidencia) =>
        evidencia.favoravel,
    ).length;

  const totalContrarias =
    evidencias.length -
    totalFavoraveis;

  const indiceContradicao =
    evidencias.length > 0
      ? totalContrarias /
        evidencias.length
      : 0;

  const base: ConhecimentoAgronomico = {
    ...atual,

    titulo:
      novo.titulo ||
      atual.titulo,

    descricao:
      novo.descricao ||
      atual.descricao,

    origem:
      "consolidacao",

    aprendizadoIds:
      unirStrings(
        atual.aprendizadoIds,
        novo.aprendizadoIds,
      ),

    evidencias,

    safraIds:
      unirStrings(
        atual.safraIds,
        novo.safraIds,
      ),

    culturas:
      unirStrings(
        atual.culturas,
        novo.culturas,
      ),

    totalAprendizados:
      unirStrings(
        atual.aprendizadoIds,
        novo.aprendizadoIds,
      ).length,

    totalEvidenciasFavoraveis:
      totalFavoraveis,

    totalEvidenciasContrarias:
      totalContrarias,

    totalEventos: Math.max(
      atual.totalEventos,
      novo.totalEventos,
    ),

    totalSafras:
      unirStrings(
        atual.safraIds,
        novo.safraIds,
      ).length,

    totalUEIs: Math.max(
      atual.totalUEIs,
      novo.totalUEIs,
    ),

    indiceContradicao: Number(
      indiceContradicao.toFixed(2),
    ),

    atualizadoEm:
      new Date().toISOString(),
  };

  const forca =
    calcularForcaConhecimento(base);

  const confiabilidade =
    calcularConfiabilidadeConhecimento(
      evidencias,
    );

  const estabilidade =
    calcularEstabilidadeConhecimento(
      base,
    );

  const atualizado = {
    ...base,
    forca,
    confiabilidade,
    estabilidade,
  };

  return {
    ...atualizado,

    maturidade:
      calcularMaturidadeConhecimento(
        atualizado,
      ),

    status:
      definirStatusConhecimento(
        atualizado,
      ),
  };
}