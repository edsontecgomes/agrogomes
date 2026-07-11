import { calcularDiferencaTemporal } from "./calcularDiferencaTemporal";
import { construirContextoTemporal } from "./construirContextoTemporal";
import { encontrarPlantioReferencia } from "./encontrarPlantioReferencia";
import { ordenarEventosCronologicamente } from "./ordenarEventosCronologicamente";
import { EventoTemporal } from "./types";

export function enriquecerEventosTemporalmente<
  T extends EventoTemporal,
>(
  eventos: T[],
): T[] {
  const ordenados =
    ordenarEventosCronologicamente(
      eventos,
      "asc",
    );

  const plantio =
    encontrarPlantioReferencia(
      ordenados,
    );

  return ordenados.map(
    (evento, indice) => {
      const anterior =
        indice > 0
          ? ordenados[indice - 1]
          : undefined;

      const diasDesdeEventoAnterior =
        anterior
          ? calcularDiferencaTemporal(
              anterior.dataEvento,
              evento.dataEvento,
            ).dias
          : undefined;

      return {
        ...evento,

        contextoTemporal:
          construirContextoTemporal({
            dataEvento:
              evento.dataEvento,

            dataPlantio:
              plantio?.dataEvento,

            safraId:
              evento.safraId,

            cultura:
              evento.cultura,

            diasDesdeEventoAnterior,
          }),
      };
    },
  );
}