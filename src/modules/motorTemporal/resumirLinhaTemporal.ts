import { encontrarPlantioReferencia } from "./encontrarPlantioReferencia";
import { ordenarEventosCronologicamente } from "./ordenarEventosCronologicamente";
import { EventoTemporal } from "./types";

export type ResumoLinhaTemporal = {
  totalEventos: number;

  primeiroEvento?: EventoTemporal;

  ultimoEvento?: EventoTemporal;

  plantioReferencia?: EventoTemporal;

  tiposEvento: string[];

  totalDiasHistorico: number;
};

export function resumirLinhaTemporal(
  eventos: EventoTemporal[],
): ResumoLinhaTemporal {
  const ordenados =
    ordenarEventosCronologicamente(
      eventos,
      "asc",
    );

  const primeiro =
    ordenados[0];

  const ultimo =
    ordenados[
      ordenados.length - 1
    ];

  const totalDiasHistorico =
    primeiro && ultimo
      ? Math.max(
          0,
          (
            Date.parse(
              ultimo.dataEvento,
            ) -
            Date.parse(
              primeiro.dataEvento,
            )
          ) /
            86_400_000,
        )
      : 0;

  return {
    totalEventos:
      ordenados.length,

    primeiroEvento:
      primeiro,

    ultimoEvento:
      ultimo,

    plantioReferencia:
      encontrarPlantioReferencia(
        ordenados,
      ),

    tiposEvento:
      Array.from(
        new Set(
          ordenados.map(
            (evento) =>
              evento.tipo,
          ),
        ),
      ),

    totalDiasHistorico:
      Number(
        totalDiasHistorico.toFixed(
          2,
        ),
      ),
  };
}