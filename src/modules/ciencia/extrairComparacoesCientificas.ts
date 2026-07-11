import { EventoAgronomico } from "../eventosAgronomicos/types";

import { ComparacaoCientificaEntrada } from "./typesMotorCientifico";

function comparacaoValida(
  valor: unknown,
): valor is ComparacaoCientificaEntrada {
  if (
    typeof valor !== "object" ||
    valor === null
  ) {
    return false;
  }

  const comparacao =
    valor as Record<string, unknown>;

  return (
    typeof comparacao.fator === "string" &&
    typeof comparacao.antes === "number" &&
    Number.isFinite(comparacao.antes) &&
    typeof comparacao.depois === "number" &&
    Number.isFinite(comparacao.depois)
  );
}

export function extrairComparacoesCientificas(
  evento: EventoAgronomico,
): ComparacaoCientificaEntrada[] {
  const comparacoes =
    evento.payloadOriginal
      .comparacoesCientificas;

  if (!Array.isArray(comparacoes)) {
    return [];
  }

  return comparacoes.filter(
    comparacaoValida,
  );
}