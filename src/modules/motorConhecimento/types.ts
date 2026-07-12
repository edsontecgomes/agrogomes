import type {
  EscopoAprendizado,
  EvidenciaAprendizado,
} from "../motorAprendizagem/types";

export type StatusConhecimento =
  | "provisorio"
  | "em_validacao"
  | "consolidado"
  | "maduro"
  | "contraditorio"
  | "arquivado";

export type NivelMaturidadeConhecimento =
  | "inicial"
  | "em_formacao"
  | "consistente"
  | "avancado"
  | "maduro";

export type OrigemConhecimento =
  | "aprendizado"
  | "consolidacao"
  | "motor_cientifico"
  | "motor_estatistico"
  | "base_global"
  | "especialista";

export type ConhecimentoAgronomico = {
  id: string;

  chave: string;

  titulo: string;

  descricao: string;

  fatorPrincipal: string;

  escopo: EscopoAprendizado;

  entidadeId: string;

  producerId?: string;

  farmId: string;

  talhaoId?: string;

  ueiId?: string;

  gdaId?: string;

  safraIds: string[];

  culturas: string[];

  origem: OrigemConhecimento;

  status: StatusConhecimento;

  maturidade: NivelMaturidadeConhecimento;

  aprendizadoIds: string[];

  evidencias: EvidenciaAprendizado[];

  totalAprendizados: number;

  totalEvidenciasFavoraveis: number;

  totalEvidenciasContrarias: number;

  totalEventos: number;

  totalSafras: number;

  totalUEIs: number;

  forca: number;

  confiabilidade: number;

  estabilidade: number;

  indiceContradicao: number;

  criadoEm: string;

  atualizadoEm: string;

  propriedades?: Record<string, unknown>;

  createdAt?: unknown;

  updatedAt?: unknown;
};

export type ResultadoConsolidacaoConhecimento = {
  conhecimentos: ConhecimentoAgronomico[];

  totalRecebidos: number;

  totalConsolidados: number;

  totalDuplicadosRemovidos: number;

  totalMaduros: number;

  totalContraditorios: number;

  confiabilidadeMedia: number;

  processadoEm: string;
};

export type ResumoConhecimentos = {
  totalConhecimentos: number;

  totalConsolidados: number;

  totalMaduros: number;

  totalContraditorios: number;

  forcaMedia: number;

  confiabilidadeMedia: number;

  estabilidadeMedia: number;

  fatoresPrincipais: string[];
};