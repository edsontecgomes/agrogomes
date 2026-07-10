import { EventoAgronomico } from "../eventosAgronomicos/types";

export function criarResumoEvento(evento: EventoAgronomico): string {
  if (evento.tipo === "chuva") {
    const volume = evento.payloadOriginal?.volumeMm;
    return `Registro de chuva${volume ? `: ${volume} mm` : ""}.`;
  }

  if (evento.tipo === "execucao_ordem") {
    const tipoOperacao = evento.payloadOriginal?.tipoOperacao;
    return `Execução de ordem${tipoOperacao ? `: ${String(tipoOperacao)}` : ""}.`;
  }

  return `Evento agronômico registrado: ${evento.tipo}.`;
}