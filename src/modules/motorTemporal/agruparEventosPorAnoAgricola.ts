import { identificarAnoAgricola } from "./identificarAnoAgricola";
import { normalizarDataISO } from "./normalizarDataISO";
import { EventoTemporal } from "./types";

export type GrupoAnoAgricola<T> = {
  anoAgricola: string;

  eventos: T[];
};

export function agruparEventosPorAnoAgricola<
  T extends EventoTemporal,
>(
  eventos: T[],
): GrupoAnoAgricola<T>[] {
  const grupos = new Map<
    string,
    T[]
  >();

  eventos.forEach((evento) => {
    const normalizacao =
      normalizarDataISO(
        evento.dataEvento,
      );

    const anoAgricola =
      identificarAnoAgricola(
        new Date(
          normalizacao.dataISO,
        ),
      );

    const lista =
      grupos.get(anoAgricola) ?? [];

    lista.push(evento);

    grupos.set(
      anoAgricola,
      lista,
    );
  });

  return Array.from(
    grupos.entries(),
  )
    .map(
      ([
        anoAgricola,
        lista,
      ]) => ({
        anoAgricola,

        eventos: lista,
      }),
    )
    .sort(
      (primeiro, segundo) =>
        primeiro.anoAgricola.localeCompare(
          segundo.anoAgricola,
        ),
    );
}