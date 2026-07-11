import { calcularDiferencaTemporal } from "./calcularDiferencaTemporal";
import { normalizarDataISO } from "./normalizarDataISO";

export function calcularDiasAposPlantio(
  dataPlantio?: string,
  dataEvento?: string,
): number | undefined {
  if (!dataPlantio || !dataEvento) {
    return undefined;
  }

  const plantio =
    normalizarDataISO(dataPlantio);

  const evento =
    normalizarDataISO(dataEvento);

  if (
    !plantio.valida ||
    !evento.valida ||
    evento.timestampMs <
      plantio.timestampMs
  ) {
    return undefined;
  }

  const diferenca =
    calcularDiferencaTemporal(
      plantio.dataISO,
      evento.dataISO,
    );

  return Math.floor(
    diferenca.dias,
  );
}