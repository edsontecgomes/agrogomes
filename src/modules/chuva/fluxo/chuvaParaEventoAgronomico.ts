import { EventoChuva } from "./eventoChuva";
import { EventoAgronomico } from "../../eventosAgronomicos/types";

type Contexto = {
  producerId: string;
  farmId: string;
  talhaoId?: string;
  ueiIds?: string[];
  gdaIds?: string[];
};

export function chuvaParaEventoAgronomico(
  chuva: EventoChuva,
  contexto: Contexto,
): Omit<
  EventoAgronomico,
  "id" | "createdAt" | "updatedAt" | "qualidadeDado"
> {
  return {
    producerId: contexto.producerId,
    farmId: contexto.farmId,
    talhaoId: contexto.talhaoId,
    ueiIds: contexto.ueiIds,
    gdaIds: contexto.gdaIds,

    tipo: "chuva",
    origem: "pluviometro",

    dataEvento: chuva.data,

    responsavelId: chuva.responsavelId,

    localizacao:
      chuva.lat && chuva.lng
        ? {
            lat: chuva.lat,
            lng: chuva.lng,
          }
        : undefined,

    payloadOriginal: {
      pluviometroId: chuva.pluviometroId,
      pluviometroNome: chuva.pluviometroNome,
      volumeMm: chuva.volumeMm,
      responsavelNome: chuva.responsavelNome,
    },
  };
}