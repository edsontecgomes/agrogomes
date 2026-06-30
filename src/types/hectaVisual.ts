export type HectaVisualLayer =
  | "talhoes"
  | "grid_hectares"
  | "chuva"
  | "solo"
  | "produtividade"
  | "operacoes"
  | "inteligencia";

export interface HectaLayerConfig {
  key: HectaVisualLayer;
  label: string;
  icon: string;
  enabled: boolean;
}