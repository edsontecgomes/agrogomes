import { EventoTemporal } from "./types";

export type GrupoSafra<T> = {
  safraId: string;

  eventos: T[];
};

export function agruparEventosPorSafra<
  T extends EventoTemporal,
>(
  eventos: T[],
): GrupoSafra<T>[] {
  const grupos = new Map<
    string,
    T[]
  >();

  eventos.forEach((evento) => {
    const safraId =
      evento.safraId ??
      "safra_nao_identificada";

    const lista =
      grupos.get(safraId) ?? [];

    lista.push(evento);

    grupos.set(
      safraId,
      lista,
    );
  });

  return Array.from(
    grupos.entries(),
  ).map(
    ([
      safraId,
      lista,
    ]) => ({
      safraId,

      eventos: lista,
    }),
  );
}