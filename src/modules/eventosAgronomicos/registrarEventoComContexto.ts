import { resolverContextoAgronomico } from "../contextoAgronomico/resolverContextoAgronomico";
import { ResolverContextoParams } from "../contextoAgronomico/types";
import { EventoAgronomicoEntrada } from "./eventoEntrada";
import { montarEventoComContexto } from "./montarEventoComContexto";
import { registrarEventoComQualidade } from "./registrarEventoComQualidade";

type Params = {
  entrada: EventoAgronomicoEntrada;
  contextoParams: ResolverContextoParams;
};

export async function registrarEventoComContexto({
  entrada,
  contextoParams,
}: Params) {
  const contexto = await resolverContextoAgronomico(contextoParams);

  const evento = montarEventoComContexto(entrada, contexto);

  return registrarEventoComQualidade(evento);
}