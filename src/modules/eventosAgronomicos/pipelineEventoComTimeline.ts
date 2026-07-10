import { registrarEventoNaTimeline } from "../memoriaAgronomica/registrarEventoNaTimeline";
import { EventoAgronomicoEntrada } from "./eventoEntrada";
import { registrarEventoComContexto } from "./registrarEventoComContexto";
import { ResolverContextoParams } from "../contextoAgronomico/types";

type Params = {
  entrada: EventoAgronomicoEntrada;
  contexto: ResolverContextoParams;
};

export async function pipelineEventoComTimeline({ entrada, contexto }: Params) {
  const evento = await registrarEventoComContexto({
    entrada,
    contextoParams: contexto,
  });

  await registrarEventoNaTimeline(evento);

  return evento;
}