import { calcularDiferencaTemporal } from "./calcularDiferencaTemporal";
import { ordenarEventosCronologicamente } from "./ordenarEventosCronologicamente";
import {
  EventoTemporal,
  IntervaloTemporal,
} from "./types";

export function calcularIntervalosEventos(
  eventos: EventoTemporal[],
): IntervaloTemporal[] {
  const ordenados =
    ordenarEventosCronologicamente(
      eventos,
      "asc",
    );

  if (ordenados.length < 2) {
    return [];
  }

  const intervalos: IntervaloTemporal[] = [];

  for (
    let indice = 1;
    indice < ordenados.length;
    indice += 1
  ) {
    const anterior =
      ordenados[indice - 1];

    const atual =
      ordenados[indice];

    const diferenca =
      calcularDiferencaTemporal(
        anterior.dataEvento,
        atual.dataEvento,
      );

    intervalos.push({
      eventoAnteriorId:
        anterior.id,

      eventoAtualId:
        atual.id,

      tipoEventoAnterior:
        anterior.tipo,

      tipoEventoAtual:
        atual.tipo,

      dataEventoAnterior:
        anterior.dataEvento,

      dataEventoAtual:
        atual.dataEvento,

      diferencaDias:
        diferenca.dias,

      diferencaHoras:
        diferenca.horas,
    });
  }

  return intervalos;
}