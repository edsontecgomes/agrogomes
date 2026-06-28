import { EventoChuva } from "./eventoChuva";

export function converterChuvaParaEventoCientifico(evento: EventoChuva) {
  return {
    id: `CHUVA-CIENTIFICA-${evento.id}`,
    tipo: "clima",
    data: new Date(evento.data),
    descricao: `Chuva registrada: ${evento.volumeMm} mm`,
    origem: "fluxo_chuva",
    payload: evento,
  };
}