import { construirContextoTemporal } from "./construirContextoTemporal";
import {
  OrigemTemporal,
  PrecisaoTemporal,
} from "./types";

type CriarPayloadTemporalEventoParams = {
  dataEvento?: string;

  dataPlantio?: string;

  safraId?: string;

  cultura?: string;

  origem?: OrigemTemporal;

  precisao?: PrecisaoTemporal;
};

export function criarPayloadTemporalEvento(
  params: CriarPayloadTemporalEventoParams,
): Record<string, unknown> {
  return construirContextoTemporal({
    dataEvento:
      params.dataEvento,

    dataPlantio:
      params.dataPlantio,

    safraId:
      params.safraId,

    cultura:
      params.cultura,

    origem:
      params.origem,

    precisao:
      params.precisao,
  });
}