import { EntidadeCientifica } from "./entidadeCientifica";
import { EventoCientifico } from "./eventoCientifico";
import { RelacaoCientifica } from "./relacaoCientifica";

export class GrafoConhecimento {

  entidades: EntidadeCientifica[] = [];

  eventos: EventoCientifico[] = [];

  relacoes: RelacaoCientifica[] = [];

  adicionarEntidade(entidade: EntidadeCientifica) {

    this.entidades.push(entidade);

  }

  adicionarEvento(evento: EventoCientifico) {

    this.eventos.push(evento);

  }

  adicionarRelacao(relacao: RelacaoCientifica) {

    this.relacoes.push(relacao);

  }

}