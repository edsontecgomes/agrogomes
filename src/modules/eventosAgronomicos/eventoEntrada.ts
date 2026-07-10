import {
  OrigemEventoAgronomico,
  TipoEventoAgronomico,
  CoordenadaEvento,
} from "./types";

export type EventoAgronomicoEntrada = {
  tipo: TipoEventoAgronomico;
  origem: OrigemEventoAgronomico;

  dataEvento?: string;
  responsavelId?: string;
  localizacao?: CoordenadaEvento;

  payloadOriginal: Record<string, unknown>;
};