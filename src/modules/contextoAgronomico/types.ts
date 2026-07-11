export type CoordenadaContexto = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type MetodoResolucaoEspacial =
  | "ponto_no_poligono"
  | "intersecao_trajeto"
  | "ponto_unico"
  | "talhao_completo"
  | "sem_localizacao"
  | "trajeto_invalido"
  | "nenhuma_uei"
  | "buffer_trajeto"
| "largura_invalida";

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

  metodoResolucaoEspacial?: MetodoResolucaoEspacial;
  confiabilidadeEspacial?: number;

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

  ueiIdsResolvidos?: string[];
  gdaIdsResolvidos?: string[];

  metodoResolucaoEspacial?: MetodoResolucaoEspacial;
  confiabilidadeEspacial?: number;

  observacoesEspaciais?: string[];
};