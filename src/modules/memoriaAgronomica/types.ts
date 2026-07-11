import type { ContextoTemporal } from "../motorTemporal/types";

export type TimelineAgronomicaItem = {
  id?: string;

  eventoAgronomicoId: string;

  producerId: string;

  farmId: string;

  talhaoId?: string;

  ueiIds?: string[];

  gdaIds?: string[];

  tipoEvento: string;

  dataEvento: string;

  resumo: string;

  contextoTemporal?: ContextoTemporal;

  createdAt?: unknown;

  updatedAt?: unknown;
};