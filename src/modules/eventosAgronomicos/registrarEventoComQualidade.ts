import { calcularQualidadeEvento } from "./calcularQualidadeEvento";
import { registrarEventoAgronomico } from "./registrarEventoAgronomico";
import { EventoAgronomico } from "./types";

export async function registrarEventoComQualidade(
  evento: Omit<EventoAgronomico, "id" | "createdAt" | "updatedAt" | "qualidadeDado">,
) {
  const qualidadeDado = calcularQualidadeEvento(evento);

  return registrarEventoAgronomico({
    ...evento,
    qualidadeDado,
  });
}