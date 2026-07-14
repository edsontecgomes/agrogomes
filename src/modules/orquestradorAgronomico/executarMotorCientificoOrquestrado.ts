import {
  processarESalvarEventoCientifico,
  ResultadoProcessamentoPersistido,
} from "../ciencia/processarESalvarEventoCientifico";

import type {
  EventoAgronomico,
} from "../eventosAgronomicos/types";

export async function executarMotorCientificoOrquestrado(
  evento: EventoAgronomico,
): Promise<ResultadoProcessamentoPersistido> {
  if (!evento.id) {
    throw new Error(
      "O Motor Científico não pode processar um evento sem ID.",
    );
  }

  return processarESalvarEventoCientifico(
    evento,
  );
}