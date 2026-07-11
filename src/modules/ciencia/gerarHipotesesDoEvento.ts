import { EvidenciaHipotese } from "./hipoteses/evidencia";
import {
  atualizarHipoteseComEvidencias,
  gerarHipotesePorFator,
} from "./hipoteses/motorHipoteses";
import { HipoteseCientifica } from "./hipoteses/hipotese";
import { FatorCientificoExtraido } from "./typesMotorCientifico";

function normalizarId(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}

export function gerarHipotesesDoEvento(
  fatores: FatorCientificoExtraido[],
  evidencias: EvidenciaHipotese[],
): HipoteseCientifica[] {
  return fatores.map((fator) => {
    const hipoteseId = `HIP-${normalizarId(
      fator.chave,
    )}`;

    const hipoteseInicial =
      gerarHipotesePorFator(
        hipoteseId,
        fator.chave,
      );

    const evidenciasDaHipotese =
      evidencias.filter(
        (evidencia) =>
          evidencia.hipoteseId === hipoteseId,
      );

    return atualizarHipoteseComEvidencias(
      hipoteseInicial,
      evidenciasDaHipotese,
    );
  });
}