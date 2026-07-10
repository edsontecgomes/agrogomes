export type GDAEspacial = {
  id: string;

  ueiId: string;

  farmId: string;

  talhaoId: string;

  status?: string;

  indiceMaturidadeCientifica?: number;

  indiceConfiabilidade?: number;

  totalEventos?: number;

  totalSafras?: number;
};

export type ResultadoResolucaoGDA = {
  gdaIds: string[];

  gdas: GDAEspacial[];

  ueiIdsSemGDA: string[];

  metodo:
    | "id_deterministico"
    | "nenhuma_uei"
    | "nenhum_gda";

  confiabilidade: number;

  observacoes: string[];
};