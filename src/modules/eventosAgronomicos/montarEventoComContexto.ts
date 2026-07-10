import { ContextoAgronomicoResolvido } from "../contextoAgronomico/types";
import { criarAuditoriaEvento } from "./auditoriaEvento";
import { EventoAgronomicoEntrada } from "./eventoEntrada";
import { calcularIQCEvento } from "./qualidade/motorQualidadeEvento";
import { EventoAgronomico } from "./types";

export function montarEventoComContexto(
  entrada: EventoAgronomicoEntrada,
  contexto: ContextoAgronomicoResolvido,
): Omit<EventoAgronomico, "id" | "createdAt" | "updatedAt" | "qualidadeDado"> {
  const evento = {
    producerId: contexto.producerId,
    farmId: contexto.farmId,
    talhaoId: contexto.talhaoId,
    ueiIds: contexto.ueiIds,
    gdaIds: contexto.gdaIds,

    tipo: entrada.tipo,
    origem: entrada.origem,

    dataEvento: entrada.dataEvento || new Date().toISOString(),
    responsavelId: entrada.responsavelId,

    localizacao: entrada.localizacao || contexto.localizacao,

    payloadOriginal: {
      ...entrada.payloadOriginal,
      contexto: {
        safraId: contexto.safraId,
        planejamentoId: contexto.planejamentoId,
        cultura: contexto.cultura,
        origemResolucao: contexto.origemResolucao,
        confiabilidadeContexto: contexto.confiabilidadeContexto,
        observacoes: contexto.observacoes,
      },
      auditoria: criarAuditoriaEvento(),
    },
  };

  const qualidadeCientifica = calcularIQCEvento(evento);

  return {
    ...evento,
    payloadOriginal: {
      ...evento.payloadOriginal,
      qualidadeCientifica,
    },
  };
}