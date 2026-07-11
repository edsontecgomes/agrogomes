import { EventoAgronomico } from "../eventosAgronomicos/types";

import { adaptarEventoAgronomico } from "./adaptarEventoAgronomico";
import { criarEntidadesDoEvento } from "./criarEntidadesDoEvento";
import { criarRelacoesDoEvento } from "./criarRelacoesDoEvento";
import { GrafoConhecimento } from "./grafoConhecimento";

export function construirGrafoDoEvento(
  evento: EventoAgronomico,
): GrafoConhecimento {
  const grafo = new GrafoConhecimento();

  const eventoCientifico =
    adaptarEventoAgronomico(evento);

  const entidades =
    criarEntidadesDoEvento(evento);

  const relacoes =
    criarRelacoesDoEvento(
      evento,
      eventoCientifico.id,
    );

  entidades.forEach((entidade) => {
    grafo.adicionarEntidade(entidade);
  });

  grafo.adicionarEvento(eventoCientifico);

  relacoes.forEach((relacao) => {
    grafo.adicionarRelacao(relacao);
  });

  return grafo;
}