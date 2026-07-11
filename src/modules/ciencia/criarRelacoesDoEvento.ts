import { EventoAgronomico } from "../eventosAgronomicos/types";

import {
  criarRelacaoCientifica,
  RelacaoCientifica,
} from "./relacaoCientifica";

export function criarRelacoesDoEvento(
  evento: EventoAgronomico,
  eventoCientificoId: string,
): RelacaoCientifica[] {
  const relacoes: RelacaoCientifica[] = [];

  if (evento.farmId && evento.producerId) {
    relacoes.push(
      criarRelacaoCientifica({
        origem: evento.farmId,
        destino: evento.producerId,
        tipo: "pertence_a",
        peso: 1,
        fonte: "evento_agronomico",
      }),
    );
  }

  if (evento.talhaoId && evento.farmId) {
    relacoes.push(
      criarRelacaoCientifica({
        origem: evento.talhaoId,
        destino: evento.farmId,
        tipo: "pertence_a",
        peso: 1,
        fonte: "evento_agronomico",
      }),
    );
  }

  (evento.ueiIds ?? []).forEach((ueiId) => {
    if (evento.talhaoId) {
      relacoes.push(
        criarRelacaoCientifica({
          origem: ueiId,
          destino: evento.talhaoId!,
          tipo: "pertence_a",
          peso: 1,
          fonte: "evento_agronomico",
        }),
      );
    }

    relacoes.push(
      criarRelacaoCientifica({
        origem: eventoCientificoId,
        destino: ueiId,
        tipo: "ocorreu_em",
        peso: 1,
        fonte: "evento_agronomico",
      }),
    );
  });

  (evento.gdaIds ?? []).forEach((gdaId) => {
    relacoes.push(
      criarRelacaoCientifica({
        origem: eventoCientificoId,
        destino: gdaId,
        tipo: "afetou",
        peso: 1,
        fonte: "evento_agronomico",
      }),
    );
  });

  if (evento.talhaoId) {
    relacoes.push(
      criarRelacaoCientifica({
        origem: eventoCientificoId,
        destino: evento.talhaoId,
        tipo: "ocorreu_em",
        peso: 0.9,
        fonte: "evento_agronomico",
      }),
    );
  }

  return relacoes;
}