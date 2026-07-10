import { EventoAgronomico } from "./types";

export function filtrarEventosPorPeriodo(
  eventos: EventoAgronomico[],
  inicio: string,
  fim: string,
): EventoAgronomico[] {
  const inicioMs = Date.parse(inicio);
  const fimMs = Date.parse(fim);

  return eventos.filter((evento) => {
    const dataMs = Date.parse(evento.dataEvento);

    return dataMs >= inicioMs && dataMs <= fimMs;
  });
}