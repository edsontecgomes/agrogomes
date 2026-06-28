export type TipoRecomendacaoAgronomica =
  | "variedade"
  | "adubacao"
  | "plantio"
  | "chuva"
  | "solo"
  | "manejo"
  | "custo"
  | "produtividade"
  | "sanidade"
  | "operacional"
  | "outro";

export type StatusRecomendacaoAgronomica =
  | "rascunho"
  | "ativa"
  | "aplicada"
  | "ignorada"
  | "descartada";

export type PrioridadeRecomendacaoAgronomica =
  | "baixa"
  | "media"
  | "alta"
  | "critica";

export interface RecomendacaoAgronomica {
  id: string;

  producerId: string;
  farmId: string;
  talhaoId?: string;

  memoriaAgronomicaId?: string;
  cicloAgronomicoId?: string;

  tipo: TipoRecomendacaoAgronomica;
  status: StatusRecomendacaoAgronomica;
  prioridade: PrioridadeRecomendacaoAgronomica;

  titulo: string;
  descricao: string;
  justificativa: string;

  acaoRecomendada?: string;
  beneficioEsperado?: string;
  riscoNaoExecutar?: string;

  aprendizadosBase: string[];
  relacoesBase: string[];
  evidencias: string[];

  confiancaPercentual: number;

  aplicavelEm?: {
    culturas?: string[];
    variedades?: string[];
    tiposSolo?: string[];
    faixasChuvaMm?: string;
    faixasProdutividade?: string;
  };

  dados?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}