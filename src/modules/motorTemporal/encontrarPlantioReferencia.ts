import { ordenarEventosCronologicamente } from "./ordenarEventosCronologicamente";
import { EventoTemporal } from "./types";

export function encontrarPlantioReferencia(
  eventos: EventoTemporal[],
): EventoTemporal | undefined {
  const plantios =
    eventos.filter(
      (evento) =>
        evento.tipo === "plantio",
    );

  return ordenarEventosCronologicamente(
    plantios,
    "asc",
  )[0];
}