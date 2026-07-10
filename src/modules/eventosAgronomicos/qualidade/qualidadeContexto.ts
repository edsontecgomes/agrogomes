import { EventoAgronomico } from "../types";
import { FatorQualidadeEvento } from "./types";

export function avaliarQualidadeContexto(
  evento: Pick<EventoAgronomico, "farmId" | "talhaoId" | "ueiIds">,
): FatorQualidadeEvento {
  const possuiFazenda = Boolean(evento.farmId);
  const possuiTalhao = Boolean(evento.talhaoId);
  const possuiUEI = Boolean(evento.ueiIds && evento.ueiIds.length > 0);

  const atingido = possuiFazenda && possuiTalhao;

  return {
    nome: "contexto_agronomico",
    peso: 30,
    atingido,
    observacao: possuiUEI
      ? "Fazenda, talhão e UEI identificados."
      : atingido
        ? "Fazenda e talhão identificados."
        : "Contexto agronômico incompleto.",
  };
}