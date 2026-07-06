export type CamadaMapa =
  | "fazendas"
  | "talhoes"
  | "ueis"
  | "pluviometros"
  | "operacoes"
  | "produtividade"
  | "solo"
  | "compactacao"
  | "telemetria"
  | "recomendacoes";

export type EstadoCamadasMapa = Record<CamadaMapa, boolean>;

export const CAMADAS_PADRAO: EstadoCamadasMapa = {
  fazendas: true,
  talhoes: true,
  ueis: true,
  pluviometros: true,
  operacoes: false,
  produtividade: false,
  solo: false,
  compactacao: false,
  telemetria: false,
  recomendacoes: false,
};