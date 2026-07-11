import { EventoAgronomico } from "../eventosAgronomicos/types";
import type { ContextoTemporal } from "../motorTemporal/types";

import { criarResumoEvento } from "./criarResumoEvento";
import { TimelineAgronomicaItem } from "./types";

type PayloadEventoComTemporal = {
  contextoTemporal?: ContextoTemporal;
};

export function montarTimelineItem(
  evento: EventoAgronomico,
): Omit<
  TimelineAgronomicaItem,
  "id" | "createdAt" | "updatedAt"
> {
  if (!evento.id) {
    throw new Error(
      "Não foi possível montar timeline: evento sem ID.",
    );
  }

  const payload =
    evento.payloadOriginal as PayloadEventoComTemporal;

  return {
    eventoAgronomicoId:
      evento.id,

    producerId:
      evento.producerId,

    farmId:
      evento.farmId,

    talhaoId:
      evento.talhaoId,

    ueiIds:
      evento.ueiIds,

    gdaIds:
      evento.gdaIds,

    tipoEvento:
      evento.tipo,

    dataEvento:
      evento.dataEvento,

    resumo:
      criarResumoEvento(
        evento,
      ),

    contextoTemporal:
      payload.contextoTemporal,
  };
}