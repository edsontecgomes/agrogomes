import { TimelineAgronomicaItem } from "./types";

export type ResumoTimelineAgronomica = {
  totalEventos: number;
  totalChuvas: number;
  totalExecucoes: number;
  ultimoEvento?: TimelineAgronomicaItem;
};

export function resumirTimeline(
  itens: TimelineAgronomicaItem[],
): ResumoTimelineAgronomica {
  return {
    totalEventos: itens.length,
    totalChuvas: itens.filter((item) => item.tipoEvento === "chuva").length,
    totalExecucoes: itens.filter((item) => item.tipoEvento === "execucao_ordem").length,
    ultimoEvento: itens[0],
  };
}