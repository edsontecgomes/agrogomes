import type {
  ConhecimentoAgronomico,
} from "../motorConhecimento/types";

export type TipoRecomendacaoAgronomica =
  | "cultivar"
  | "populacao_plantas"
  | "adubacao"
  | "janela_plantio"
  | "manejo"
  | "operacao"
  | "correcao_solo"
  | "investigacao"
  | "outro";

export type StatusRecomendacao =
  | "rascunho"
  | "disponivel"
  | "aceita"
  | "rejeitada"
  | "executada"
  | "expirada"
  | "cancelada";

export type PrioridadeRecomendacao =
  | "baixa"
  | "media"
  | "alta"
  | "critica";

export type NivelRiscoRecomendacao =
  | "muito_baixo"
  | "baixo"
  | "moderado"
  | "alto"
  | "muito_alto";

export type CaminhoRecomendacaoAgronomica =
  | "ajuste_incremental"
  | "potencial_estrutural"
  | "manter_manejo"
  | "investigar"
  | "nao_recomendar";

export type CriterioRecomendacao = {
  id: string;

  nome: string;

  descricao: string;

  peso: number;

  atendido: boolean;

  pontuacao: number;

  valorObservado?: unknown;

  valorEsperado?: unknown;

  conhecimentoId?: string;
};

export type RiscoRecomendacao = {
  id: string;

  nome: string;

  descricao: string;

  nivel: NivelRiscoRecomendacao;

  probabilidade: number;

  impacto: number;

  pontuacao: number;

  impeditivo: boolean;

  conhecimentoId?: string;
};

export type BeneficioRecomendacao = {
  ganhoEstimadoScHa?: number;

  ganhoEstimadoPercentual?: number;

  economiaEstimadaPorHa?: number;

  areaBeneficiadaHa?: number;

  percentualAreaBeneficiada?: number;

  pontuacaoBeneficio: number;

  descricao: string;
};

export type AlternativaManejo = {
  id: string;

  tipo: TipoRecomendacaoAgronomica;

  titulo: string;

  descricao: string;

  valorProposto?: unknown;

  unidade?: string;

  caminho:
    CaminhoRecomendacaoAgronomica;

  criterios: CriterioRecomendacao[];

  riscos: RiscoRecomendacao[];

  beneficio?: BeneficioRecomendacao;

  conhecimentoIds: string[];

  propriedades?: Record<string, unknown>;
};

export type ContextoRecomendacao = {
  producerId?: string;

  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraId?: string;

  cultura?: string;

  areaHa?: number;

  cultivarAtual?: string;

  populacaoAtual?: number;

  janelaPlantioAtual?: string;

  produtividadeHistoricaScHa?: number;

  conhecimentos:
    ConhecimentoAgronomico[];

  propriedades?: Record<string, unknown>;
};

export type RecomendacaoAgronomica = {
  id: string;

  tipo: TipoRecomendacaoAgronomica;

  titulo: string;

  descricao: string;

  producerId?: string;

  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraId?: string;

  cultura?: string;

  alternativaId: string;

  caminho:
    CaminhoRecomendacaoAgronomica;

  status: StatusRecomendacao;

  prioridade:
    PrioridadeRecomendacao;

  risco:
    NivelRiscoRecomendacao;

  pontuacaoBeneficio: number;

  pontuacaoRisco: number;

  pontuacaoCompatibilidade: number;

  pontuacaoFinal: number;

  confiabilidade: number;

  beneficio?: BeneficioRecomendacao;

  criterios: CriterioRecomendacao[];

  riscos: RiscoRecomendacao[];

  conhecimentoIds: string[];

  justificativas: string[];

  limitacoes: string[];

  condicoesParaAplicacao: string[];

  criadoEm: string;

  atualizadoEm: string;

  expiraEm?: string;

  propriedades?: Record<string, unknown>;

  createdAt?: unknown;

  updatedAt?: unknown;
};

export type ResultadoMotorRecomendacao = {
  recomendacoes:
    RecomendacaoAgronomica[];

  totalAlternativas: number;

  totalRecomendacoes: number;

  totalImpedidas: number;

  recomendacaoPrincipal?:
    RecomendacaoAgronomica;

  confiabilidadeMedia: number;

  processadoEm: string;
};