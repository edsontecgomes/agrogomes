import { normalizarDataISO } from "./normalizarDataISO";
import { EventoTemporal } from "./types";

export function ordenarEventosCronologicamente<
  T extends EventoTemporal,
>(
  eventos: T[],
  ordem: "asc" | "desc" = "asc",
): T[] {
  return [...eventos].sort(
    (primeiro, segundo) => {
      const dataPrimeiro =
        normalizarDataISO(
          primeiro.dataEvento,
        ).timestampMs;

      const dataSegundo =
        normalizarDataISO(
          segundo.dataEvento,
        ).timestampMs;

      return ordem === "asc"
        ? dataPrimeiro - dataSegundo
        : dataSegundo - dataPrimeiro;
    },
  );
}