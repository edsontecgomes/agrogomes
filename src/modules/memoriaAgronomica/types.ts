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

  createdAt?: unknown;
  updatedAt?: unknown;
};