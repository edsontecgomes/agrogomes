import { ResolverContextoParams } from "../contextoAgronomico/types";
import { EventoAgronomicoEntrada } from "./eventoEntrada";
import { pipelineEventoComTimeline } from "./pipelineEventoComTimeline";

type Params = {
  entrada: EventoAgronomicoEntrada;
  contexto: ResolverContextoParams;
};

export async function pipelineCientifico({ entrada, contexto }: Params) {
  return pipelineEventoComTimeline({
    entrada,
    contexto,
  });
}