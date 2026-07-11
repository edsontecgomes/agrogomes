import { EventoAgronomico } from "../eventosAgronomicos/types";

import {
  criarEvidenciaHipotese,
  EvidenciaHipotese,
} from "./hipoteses/evidencia";
import { FatorCientificoExtraido } from "./typesMotorCientifico";

function normalizarId(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}

export function criarEvidenciasDoEvento(
  evento: EventoAgronomico,
  fatores: FatorCientificoExtraido[],
): EvidenciaHipotese[] {
  const eventoId =
    evento.id ??
    `${evento.tipo}-${Date.parse(evento.dataEvento)}`;

  const entidadeId =
    evento.ueiIds?.[0] ??
    evento.talhaoId ??
    evento.farmId;

  return fatores.map((fator, indice) => {
    const hipoteseId = `HIP-${normalizarId(
      fator.chave,
    )}`;

    const evidenciaId = [
      "EVI",
      normalizarId(eventoId),
      normalizarId(fator.chave),
      String(indice + 1).padStart(3, "0"),
    ].join("-");

    return criarEvidenciaHipotese(
      evidenciaId,
      hipoteseId,
      entidadeId,
      fator.descricao,
      fator.peso,
    );
  });
}