import { normalizarDataISO } from "./normalizarDataISO";
import { EventoTemporal } from "./types";

export type GrupoEventosDia<T> = {
  data: string;

  eventos: T[];
};

export function agruparEventosPorDia<
  T extends EventoTemporal,
>(
  eventos: T[],
): GrupoEventosDia<T>[] {
  const grupos = new Map<
    string,
    T[]
  >();

  eventos.forEach((evento) => {
    const normalizacao =
      normalizarDataISO(
        evento.dataEvento,
      );

    const chave =
      normalizacao.dataISO.slice(
        0,
        10,
      );

    const lista =
      grupos.get(chave) ?? [];

    lista.push(evento);

    grupos.set(
      chave,
      lista,
    );
  });

  return Array.from(
    grupos.entries(),
  )
    .map(([data, lista]) => ({
      data,

      eventos: lista,
    }))
    .sort(
      (primeiro, segundo) =>
        primeiro.data.localeCompare(
          segundo.data,
        ),
    );
}