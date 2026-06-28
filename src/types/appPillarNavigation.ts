export type AppPillarKey =
  | "fazenda"
  | "operacoes"
  | "agronomia"
  | "inteligencia"
  | "gestao";

export interface AppPillarItem {
  label: string;
  description: string;
  path: string;
  icon: string;
  enabled: boolean;
}

export interface AppPillarConfig {
  key: AppPillarKey;
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  items: AppPillarItem[];
}