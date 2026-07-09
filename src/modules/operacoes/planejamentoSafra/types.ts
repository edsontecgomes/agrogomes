export type StatusSafra =
  | "planejada"
  | "em_andamento"
  | "finalizada"
  | "cancelada";

export type CulturaSafra =
  | "soja"
  | "milho"
  | "sorgo"
  | "arroz"
  | "feijao"
  | "algodao"
  | "pastagem"
  | "outra";

export type PlanejamentoSafra = {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId: string;

  nome: string;
  anoAgricola: string;

  cultura: CulturaSafra;
  culturaDescricao?: string;

  variedade?: string;
  loteSemente?: string;

  populacaoPlantasHa?: number;

  espacamentoCm?: number;

  status: StatusSafra;

  dataPrevistaPlantio?: string;
  dataPrevistaColheita?: string;

  observacoes?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
};