import { ContextoAgronomicoResolvido } from "../contextoAgronomico/types";
import { criarPayloadTemporalEvento } from "../motorTemporal/criarPayloadTemporalEvento";

import { criarAuditoriaEvento } from "./auditoriaEvento";
import { EventoAgronomicoEntrada } from "./eventoEntrada";
import { calcularIQCEvento } from "./qualidade/motorQualidadeEvento";
import { EventoAgronomico } from "./types";

export function montarEventoComContexto(
  entrada: EventoAgronomicoEntrada,
  contexto: ContextoAgronomicoResolvido,
): Omit<
  EventoAgronomico,
  "id" | "createdAt" | "updatedAt" | "qualidadeDado"
> {
  const dataEvento =
    entrada.dataEvento ||
    new Date().toISOString();

  const contextoTemporal =
    criarPayloadTemporalEvento({
      dataEvento,

      safraId:
        contexto.safraId,

      cultura:
        contexto.cultura,

      origem:
        "evento",

      precisao:
        entrada.dataEvento
          ? "exata"
          : "estimada",
    });

  const evento = {
    producerId:
      contexto.producerId,

    farmId:
      contexto.farmId,

    talhaoId:
      contexto.talhaoId,

    ueiIds:
      contexto.ueiIds,

    gdaIds:
      contexto.gdaIds,

    tipo:
      entrada.tipo,

    origem:
      entrada.origem,

    dataEvento,

    responsavelId:
      entrada.responsavelId,

    localizacao:
      entrada.localizacao ||
      contexto.localizacao,

    payloadOriginal: {
      ...entrada.payloadOriginal,

      contexto: {
        safraId:
          contexto.safraId,

        planejamentoId:
          contexto.planejamentoId,

        cultura:
          contexto.cultura,

        origemResolucao:
          contexto.origemResolucao,

        metodoResolucaoEspacial:
          contexto.metodoResolucaoEspacial,

        confiabilidadeEspacial:
          contexto.confiabilidadeEspacial,

        confiabilidadeContexto:
          contexto.confiabilidadeContexto,

        observacoes:
          contexto.observacoes,
      },

      contextoTemporal,

      auditoria:
        criarAuditoriaEvento(),
    },
  };

  const qualidadeCientifica =
    calcularIQCEvento(evento);

  return {
    ...evento,

    payloadOriginal: {
      ...evento.payloadOriginal,

      qualidadeCientifica,
    },
  };
}