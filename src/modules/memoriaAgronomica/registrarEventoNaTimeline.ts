import { EventoAgronomico } from "../eventosAgronomicos/types";
import { montarTimelineItem } from "./montarTimelineItem";
import { salvarTimelineItem } from "./salvarTimelineItem";

export async function registrarEventoNaTimeline(evento: EventoAgronomico) {
  const item = montarTimelineItem(evento);

  return salvarTimelineItem(item);
}