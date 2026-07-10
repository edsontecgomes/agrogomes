import { EventoAgronomico, QualidadeDadoEvento } from "./types";

export function calcularQualidadeEvento(
  evento: Pick<
    EventoAgronomico,
    "talhaoId" | "ueiIds" | "responsavelId" | "localizacao"
  >,
): QualidadeDadoEvento {
  const possuiLocalizacao = Boolean(evento.localizacao);
  const possuiTalhao = Boolean(evento.talhaoId);
  const possuiUEI = Boolean(evento.ueiIds && evento.ueiIds.length > 0);
  const possuiResponsavel = Boolean(evento.responsavelId);

  const pontos = [
    possuiLocalizacao,
    possuiTalhao,
    possuiUEI,
    possuiResponsavel,
  ].filter(Boolean).length;

  return {
    possuiLocalizacao,
    possuiTalhao,
    possuiUEI,
    possuiResponsavel,
    confiabilidade: Number((pontos / 4).toFixed(2)),
  };
}