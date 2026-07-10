import { EventoAgronomico } from "./types";

export type VerificacaoEvento = {
  valido: boolean;
  problemas: string[];
};

export function verificarEventoCompleto(evento: EventoAgronomico): VerificacaoEvento {
  const problemas: string[] = [];

  if (!evento.producerId) problemas.push("producerId ausente.");
  if (!evento.farmId) problemas.push("farmId ausente.");
  if (!evento.tipo) problemas.push("tipo ausente.");
  if (!evento.origem) problemas.push("origem ausente.");
  if (!evento.dataEvento) problemas.push("dataEvento ausente.");
  if (!evento.payloadOriginal) problemas.push("payloadOriginal ausente.");

  return {
    valido: problemas.length === 0,
    problemas,
  };
}