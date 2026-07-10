import { EventoAgronomico } from "../types";
import { avaliarQualidadeContexto } from "./qualidadeContexto";
import { avaliarQualidadeGPS } from "./qualidadeGPS";
import { avaliarQualidadePayload } from "./qualidadePayload";
import { avaliarQualidadeResponsavel } from "./qualidadeResponsavel";
import { avaliarQualidadeTemporal } from "./qualidadeTemporal";
import { ResultadoQualidadeEvento } from "./types";

export function calcularIQCEvento(
  evento: Omit<EventoAgronomico, "id" | "createdAt" | "updatedAt" | "qualidadeDado">,
): ResultadoQualidadeEvento {
  const fatores = [
    avaliarQualidadeGPS(evento.localizacao),
    avaliarQualidadeContexto(evento),
    avaliarQualidadeResponsavel(evento.responsavelId),
    avaliarQualidadeTemporal(evento.dataEvento),
    avaliarQualidadePayload(evento.payloadOriginal),
  ];

  const totalPesos = fatores.reduce((soma, fator) => soma + fator.peso, 0);

  const pontosObtidos = fatores.reduce(
    (soma, fator) => soma + (fator.atingido ? fator.peso : 0),
    0,
  );

  return {
    indiceQualidadeCientifica: Number(
      ((pontosObtidos / totalPesos) * 100).toFixed(2),
    ),
    fatores,
  };
}