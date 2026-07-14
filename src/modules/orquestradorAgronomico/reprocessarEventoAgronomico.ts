import { processarEventoAgronomicoCompleto } from "./processarEventoAgronomicoCompleto";

import type {
  EntradaOrquestradorAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

export async function reprocessarEventoAgronomico(
  entrada: EntradaOrquestradorAgronomico,
): Promise<ResultadoOrquestradorAgronomico> {
  if (!entrada.chaveIdempotencia) {
    throw new Error(
      "O reprocessamento exige uma chave de idempotência explícita.",
    );
  }

  return processarEventoAgronomicoCompleto({
    ...entrada,

    origemSolicitacao:
      "reprocessamento",

    permitirReprocessamento:
      true,
  });
}