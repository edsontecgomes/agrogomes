import { extrairIQCEvento } from "./extrairIQCEvento";
import { EventoAgronomico } from "./types";

export type ResumoEventosAgronomicos = {
  totalEventos: number;
  totalChuvas: number;
  totalExecucoes: number;
  iqcMedio: number | null;
  ultimoEvento?: EventoAgronomico;
};

export function resumirEventosAgronomicos(
  eventos: EventoAgronomico[],
): ResumoEventosAgronomicos {
  const iqcs = eventos
    .map(extrairIQCEvento)
    .filter((valor): valor is number => typeof valor === "number");

  const iqcMedio =
    iqcs.length > 0
      ? Number((iqcs.reduce((soma, valor) => soma + valor, 0) / iqcs.length).toFixed(2))
      : null;

  return {
    totalEventos: eventos.length,
    totalChuvas: eventos.filter((evento) => evento.tipo === "chuva").length,
    totalExecucoes: eventos.filter((evento) => evento.tipo === "execucao_ordem").length,
    iqcMedio,
    ultimoEvento: eventos[0],
  };
}