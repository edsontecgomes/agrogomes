export type UeiStatus = "planejada" | "ativa" | "arquivada";

export type Uei = {
  id: string;
  farmId: string;
  talhaoId: string;
  codigo: string;
  nome?: string;
  areaHa: number;
  status: UeiStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UeiResumoManejo = {
  ueiId: string;
  totalOrdens: number;
  totalChuvasMm: number;
  ultimaOperacao?: string;
  ultimaChuva?: string;
};

export type UeiFaseDados = {
  chuvas: boolean;
  ordensServico: boolean;
  solo: boolean;
  telemetria: boolean;
};