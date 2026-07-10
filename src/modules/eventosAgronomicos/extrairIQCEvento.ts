import { EventoAgronomico } from "./types";

type PayloadComIQC = {
  qualidadeCientifica?: {
    indiceQualidadeCientifica?: number;
  };
};

export function extrairIQCEvento(evento: EventoAgronomico): number | null {
  const payload = evento.payloadOriginal as PayloadComIQC;

  const iqc = payload.qualidadeCientifica?.indiceQualidadeCientifica;

  return typeof iqc === "number" ? iqc : null;
}