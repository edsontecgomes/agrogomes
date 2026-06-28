export type AppModuleKey =
  | "inicio"
  | "fazenda"
  | "talhoes"
  | "ciclo"
  | "manejo"
  | "chuva"
  | "operacoes"
  | "agronomia"
  | "inteligencia"
  | "admin";

export interface AppModuleConfig {
  key: AppModuleKey;
  label: string;
  description: string;
  path: string;
  icon: string;
  enabled: boolean;
  mobilePriority: number;
}