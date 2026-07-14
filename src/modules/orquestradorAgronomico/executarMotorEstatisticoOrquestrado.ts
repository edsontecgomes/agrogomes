import type {
  EventoAgronomico,
} from "../eventosAgronomicos/types";

import { processarEventosAgronomicos } from "../motorEstatistico/processarEventosAgronomicos";
import { salvarResultadoEstatistico } from "../motorEstatistico/salvarResultadoEstatistico";

import type {
  ContextoMotoresPosteriores,
} from "./extrairContextoMotores";

import type {
  ResultadoEstatisticoOrquestrado,
} from "./typesMotoresOrquestrados";

export async function executarMotorEstatisticoOrquestrado(
  evento: EventoAgronomico,
  contexto: ContextoMotoresPosteriores,
): Promise<ResultadoEstatisticoOrquestrado> {
  if (!evento.id) {
    throw new Error(
      "O Motor Estatístico não pode processar um evento sem ID.",
    );
  }

  const resultado =
    processarEventosAgronomicos([
      evento,
    ]);

  const resultadoId =
    await salvarResultadoEstatistico({
      farmId:
        contexto.farmId,

      talhaoId:
        contexto.talhaoId,

      ueiId:
        contexto.ueiId,

      safraId:
        contexto.safraId,

      resultado,
    });

  return {
    resultadoId,

    resultado,
  };
}