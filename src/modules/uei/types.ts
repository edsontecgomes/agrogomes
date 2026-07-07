export type CoordenadaUEI = {
  lat: number;
  lng: number;
};

export type UeiStatus = "planejada" | "ativa" | "arquivada" | "experimental";

export type UeiOrigem =
  | "manual"
  | "grid"
  | "grid_1ha"
  | "grid_geografico"
  | "produtividade"
  | "solo"
  | "altitude"
  | "drone"
  | "satelite"
  | "ia";

export type Uei = {
  id: string;
  producerId?: string;
  farmId: string;
  talhaoId: string;
  codigo: string;
  nome?: string;
  numero?: number;
  areaHa: number;
  geometria?: CoordenadaUEI[];
  centroide?: CoordenadaUEI;
  origem?: UeiOrigem;
  status: UeiStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  criadoEm?: Date;
  atualizadoEm?: Date;
};

export type UEI = Uei;

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