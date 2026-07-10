export type CoordenadaContexto = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type ContextoAgronomicoResolvido = {
  producerId: string;
  farmId: string;

  talhaoId?: string;

  ueiIds?: string[];

  gdaIds?: string[];

  safraId?: string;

  planejamentoId?: string;

  cultura?: string;

  origemResolucao:
    | "manual"
    | "gps"
    | "talhao_informado"
    | "ordem_servico"
    | "sistema";

  localizacao?: CoordenadaContexto;

  confiabilidadeContexto: number;

  observacoes?: string[];
};

export type ResolverContextoParams = {
  producerId: string;
  farmId: string;

  talhaoId?: string;

  ordemProgramadaId?: string;

  localizacao?: CoordenadaContexto;

  dataReferencia?: string;
};