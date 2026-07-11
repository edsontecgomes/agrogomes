import { EntidadeCientifica } from "./entidadeCientifica";
import { EventoCientifico } from "./eventoCientifico";
import { RelacaoCientifica } from "./relacaoCientifica";
import { IdCientifico } from "./tipos";

export class GrafoConhecimento {
  entidades: EntidadeCientifica[] = [];

  eventos: EventoCientifico[] = [];

  relacoes: RelacaoCientifica[] = [];

  adicionarEntidade(
    entidade: EntidadeCientifica,
  ): EntidadeCientifica {
    const existente = this.entidades.find(
      (item) => item.id === entidade.id,
    );

    if (existente) {
      return existente;
    }

    this.entidades.push(entidade);

    return entidade;
  }

  adicionarEvento(
    evento: EventoCientifico,
  ): EventoCientifico {
    const existente = this.eventos.find(
      (item) => item.id === evento.id,
    );

    if (existente) {
      return existente;
    }

    this.eventos.push(evento);

    return evento;
  }

  adicionarRelacao(
    relacao: RelacaoCientifica,
  ): RelacaoCientifica {
    const existente = this.relacoes.find(
      (item) =>
        item.origem === relacao.origem &&
        item.destino === relacao.destino &&
        item.tipo === relacao.tipo,
    );

    if (existente) {
      return existente;
    }

    this.relacoes.push(relacao);

    return relacao;
  }

  buscarEntidade(
    entidadeId: IdCientifico,
  ): EntidadeCientifica | undefined {
    return this.entidades.find(
      (entidade) => entidade.id === entidadeId,
    );
  }

  buscarEvento(
    eventoId: IdCientifico,
  ): EventoCientifico | undefined {
    return this.eventos.find(
      (evento) => evento.id === eventoId,
    );
  }

  buscarRelacoesDaOrigem(
    origemId: IdCientifico,
  ): RelacaoCientifica[] {
    return this.relacoes.filter(
      (relacao) => relacao.origem === origemId,
    );
  }

  buscarRelacoesDoDestino(
    destinoId: IdCientifico,
  ): RelacaoCientifica[] {
    return this.relacoes.filter(
      (relacao) => relacao.destino === destinoId,
    );
  }

  totalElementos(): number {
    return (
      this.entidades.length +
      this.eventos.length +
      this.relacoes.length
    );
  }
}