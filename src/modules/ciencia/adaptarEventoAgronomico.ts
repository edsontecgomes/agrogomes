import { EventoAgronomico } from "../eventosAgronomicos/types";

import { criarEventoCientifico } from "./eventoCientifico";
import { EventoCientifico } from "./eventoCientifico";
import { TipoEvento } from "./tipos";

function converterTipoEvento(
  tipo: EventoAgronomico["tipo"],
): TipoEvento {
  return tipo as TipoEvento;
}

function criarDescricao(
  evento: EventoAgronomico,
): string {
  if (evento.tipo === "chuva") {
    const volumeMm =
      evento.payloadOriginal.volumeMm;

    return typeof volumeMm === "number"
      ? `Chuva registrada: ${volumeMm} mm.`
      : "Registro de chuva.";
  }

  if (evento.tipo === "execucao_ordem") {
    const tipoOperacao =
      evento.payloadOriginal.tipoOperacao;

    return tipoOperacao
      ? `Execução de ordem: ${String(tipoOperacao)}.`
      : "Execução de ordem agronômica.";
  }

  return `Evento agronômico do tipo ${evento.tipo}.`;
}

function extrairConfiabilidade(
  evento: EventoAgronomico,
): number | undefined {
  const qualidade =
    evento.payloadOriginal
      .qualidadeCientifica as
      | {
          indiceQualidadeCientifica?: number;
        }
      | undefined;

  return qualidade?.indiceQualidadeCientifica;
}

export function adaptarEventoAgronomico(
  evento: EventoAgronomico,
): EventoCientifico {
  const eventoId =
    evento.id ??
    `${evento.tipo}-${Date.parse(evento.dataEvento)}`;

  const entidadeIds = [
    evento.producerId,
    evento.farmId,
    evento.talhaoId,
    ...(evento.ueiIds ?? []),
    ...(evento.gdaIds ?? []),
  ].filter((id): id is string => Boolean(id));

  return criarEventoCientifico({
    id: `CIENTIFICO-${eventoId}`,
    eventoAgronomicoId: evento.id,
    tipo: converterTipoEvento(evento.tipo),
    data: new Date(evento.dataEvento),
    descricao: criarDescricao(evento),
    origem: "evento_agronomico",
    entidadeIds,
    producerId: evento.producerId,
    farmId: evento.farmId,
    talhaoId: evento.talhaoId,
    ueiIds: evento.ueiIds,
    gdaIds: evento.gdaIds,
    confiabilidade: extrairConfiabilidade(evento),
    propriedades: {
      origemEvento: evento.origem,
      localizacao: evento.localizacao,
      payloadOriginal: evento.payloadOriginal,
    },
  });
}