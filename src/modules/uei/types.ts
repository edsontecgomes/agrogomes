import { CoordenadaGeografica } from "../geometria";

export type UeiStatus = "planejada" | "ativa" | "arquivada";

export type UeiOrigem =
  | "manual"
  | "grid_1ha"
  | "grid_geografico"
  | "produtividade"
  | "solo"
  | "altitude"
  | "drone"
  | "ia";

export type Uei = {
  id: string;
  farmId: string;
  talhaoId: string;
  codigo: string;
  nome?: string;
  areaHa: number;
  status: UeiStatus;

  origem?: UeiOrigem;
  numero?: number;
  centroide?: CoordenadaGeografica;
  geometria?: CoordenadaGeografica[];

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