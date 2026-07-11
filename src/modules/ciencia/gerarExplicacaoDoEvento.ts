import { EventoAgronomico } from "../eventosAgronomicos/types";

import { FatorImpacto } from "./explicabilidade/fatorImpacto";
import { gerarExplicacao } from "./explicabilidade/motorExplicabilidade";

function possuiFatoresImpacto(
  valor: unknown,
): valor is FatorImpacto[] {
  return (
    Array.isArray(valor) &&
    valor.length > 0
  );
}

export function gerarExplicacaoDoEvento(
  evento: EventoAgronomico,
): ReturnType<typeof gerarExplicacao> | undefined {
  const fatores =
    evento.payloadOriginal
      .fatoresImpacto;

  if (!possuiFatoresImpacto(fatores)) {
    return undefined;
  }

  const unidadeReferencia =
    evento.ueiIds?.[0] ??
    evento.talhaoId ??
    evento.farmId;

  return gerarExplicacao(
    unidadeReferencia,
    fatores,
  );
}