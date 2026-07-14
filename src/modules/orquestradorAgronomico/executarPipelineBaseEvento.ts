import { pipelineCientifico } from "../eventosAgronomicos/pipelineCientifico";
import type {
  EventoAgronomico,
} from "../eventosAgronomicos/types";

import type {
  EntradaOrquestradorAgronomico,
} from "./types";

export async function executarPipelineBaseEvento(
  entrada: EntradaOrquestradorAgronomico,
): Promise<EventoAgronomico> {
  return pipelineCientifico({
    entrada:
      entrada.entrada,

    contexto:
      entrada.contexto,
  });
}