import { pipelineCientifico } from "../../eventosAgronomicos";
import { EventoChuva } from "./eventoChuva";

type Params = {
  chuva: EventoChuva;
  producerId: string;
};

export async function registrarChuvaCientifica({
  chuva,
  producerId,
}: Params) {
  return pipelineCientifico({
    entrada: {
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
      payloadOriginal: chuva,
    },

    contexto: {
      producerId,
      farmId: chuva.farmId,
      localizacao:
        chuva.lat && chuva.lng
          ? {
              lat: chuva.lat,
              lng: chuva.lng,
            }
          : undefined,
    },
  });
}