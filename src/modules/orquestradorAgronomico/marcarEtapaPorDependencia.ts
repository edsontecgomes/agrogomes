import { adicionarAlertaResultado } from "./adicionarAlertaResultado";
import { marcarEtapaIgnorada } from "./marcarEtapaIgnorada";

import type {
  NomeEtapaAgronomica,
  ResultadoOrquestradorAgronomico,
} from "./types";

export function marcarEtapaPorDependencia(
  resultado:
    ResultadoOrquestradorAgronomico,
  etapa:
    NomeEtapaAgronomica,
  dependencia:
    NomeEtapaAgronomica,
): ResultadoOrquestradorAgronomico {
  const mensagem =
    `A etapa ${etapa} foi ignorada porque a dependência ${dependencia} não foi concluída.`;

  const atualizado =
    marcarEtapaIgnorada(
      resultado,
      etapa,
      mensagem,
    );

  return adicionarAlertaResultado(
    atualizado,
    mensagem,
  );
}