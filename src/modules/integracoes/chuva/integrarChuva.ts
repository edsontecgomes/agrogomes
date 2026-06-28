import { EventoChuvaFirestore } from "./eventoChuvaFirestore";
import { criarEventoChuva } from "../../chuva/fluxo/eventoChuva";

export function integrarChuvaFirestore(evento: EventoChuvaFirestore) {
  return criarEventoChuva({
    id: evento.id,
    farmId: evento.farmId,
    pluviometroId: evento.pluviometroId,
    pluviometroNome: evento.pluviometroNome,
    volumeMm: evento.volumeMm,
    responsavelId: evento.responsavelId || "desconhecido",
    responsavelNome: evento.responsavelNome,
    lat: evento.lat,
    lng: evento.lng,
    data: evento.data,
  });
}