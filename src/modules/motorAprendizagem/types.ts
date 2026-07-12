export type EscopoAprendizado =
  | "uei"
  | "gda"
  | "talhao"
  | "fazenda"
  | "safra"
  | "global";

export type StatusAprendizado =
  | "inicial"
  | "em_observacao"
  | "consistente"
  | "forte"
  | "contraditorio"
  | "arquivado";

export type OrigemAprendizado =
  | "motor_cientifico"
  | "motor_estatistico"
  | "descoberta"
  | "hipotese"
  | "evento"
  | "consolidacao";

export type EvidenciaAprendizado = {
  id: string;

  origemId?: string;

  tipo:
    | "estatistica"
    | "cientifica"
    | "evento"
    | "descoberta"
    | "hipotese";

  descricao: string;

  favoravel: boolean;

  peso: number;

  confiabilidade: number;

  criadaEm: string;
};

export type AprendizadoAgronomico = {
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

  safraId?: string;

  cultura?: string;

  status: StatusAprendizado;

  origem: OrigemAprendizado;

  evidencias: EvidenciaAprendizado[];

  totalEvidenciasFavoraveis: number;

  totalEvidenciasContrarias: number;

  numeroEventos: number;

  numeroSafras: number;

  numeroUEIs: number;

  forca: number;

  confiabilidade: number;

  criadoEm: string;

  atualizadoEm: string;

  propriedades?: Record<string, unknown>;
};

export type ContradicaoAprendizado = {
  aprendizadoId: string;

  existeContradicao: boolean;

  totalFavoraveis: number;

  totalContrarias: number;

  indiceContradicao: number;

  descricao?: string;
};

export type ResultadoMotorAprendizagem = {
  aprendizados: AprendizadoAgronomico[];

  totalAprendizados: number;

  totalConsistentes: number;

  totalFortes: number;

  totalContraditorios: number;

  confiabilidadeMedia: number;

  processadoEm: string;
};