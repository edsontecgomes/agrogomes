import { EventoAgronomico } from "../eventosAgronomicos/types";

import { construirGrafoDoEvento } from "./construirGrafoDoEvento";
import { GrafoConhecimento } from "./grafoConhecimento";

export type ResultadoMotorCientificoEvento = {
  eventoAgronomicoId?: string;

  grafo: GrafoConhecimento;

  totalEntidades: number;

  totalEventos: number;

  totalRelacoes: number;

  processadoEm: Date;
};

export function executarMotorCientificoEvento(
  evento: EventoAgronomico,
): ResultadoMotorCientificoEvento {
  const grafo =
    construirGrafoDoEvento(evento);

  return {
    eventoAgronomicoId: evento.id,

    grafo,

    totalEntidades:
      grafo.entidades.length,

    totalEventos:
      grafo.eventos.length,

    totalRelacoes:
      grafo.relacoes.length,

    processadoEm: new Date(),
  };
}