import type {
  NomeEtapaAgronomica,
  RegistroEtapaAgronomica,
  RegistroProcessamentoAgronomico,
  StatusProcessamentoAgronomico,
} from "../types";

export type ErroAuditoriaAgronomica = {
  etapa?: NomeEtapaAgronomica;

  codigo: string;

  mensagem: string;

  recuperavel: boolean;

  criadoEm?: string;
};

export type ProcessamentoAuditoriaResumo = {
  id: string;

  chaveIdempotencia: string;

  processamentoId: string;

  processamentoAnteriorId?: string;

  producerId?: string;

  farmId: string;

  talhaoId?: string;

  tipoEvento: string;

  origemSolicitacao?: string;

  status:
    StatusProcessamentoAgronomico;

  tentativas: number;

  ultimaEtapaConcluida?:
    NomeEtapaAgronomica;

  etapaComFalha?:
    NomeEtapaAgronomica;

  eventoAgronomicoId?: string;

  resultadoCientificoId?: string;

  resultadoEstatisticoId?: string;

  aprendizadoIds: string[];

  conhecimentoIds: string[];

  recomendacaoIds: string[];

  etapas:
    RegistroEtapaAgronomica[];

  totalAlertas: number;

  totalErros: number;

  iniciadoEm?: string;

  finalizadoEm?: string;

  atualizadoEm?: string;
};

export type AuditoriaProcessamentoDetalhada = {
  processamentoId: string;

  chaveIdempotencia: string;

  processamentoAnteriorId?: string;

  status:
    StatusProcessamentoAgronomico;

  origemSolicitacao?: string;

  producerId?: string;

  farmId: string;

  talhaoId?: string;

  tipoEvento: string;

  origemEvento?: string;

  tentativas: number;

  idempotenciaReutilizada: boolean;

  eventoAgronomicoId?: string;

  resultadoCientificoId?: string;

  resultadoEstatisticoId?: string;

  aprendizadoIds: string[];

  conhecimentoIds: string[];

  recomendacaoIds: string[];

  etapas:
    RegistroEtapaAgronomica[];

  registros:
    RegistroProcessamentoAgronomico[];

  alertas: string[];

  erros:
    ErroAuditoriaAgronomica[];

  iniciadoEm?: string;

  finalizadoEm?: string;

  duracaoTotalMs?: number;
};

export type FiltroPainelAuditoria = {
  farmId: string;

  status?:
    StatusProcessamentoAgronomico;

  tipoEvento?: string;

  talhaoId?: string;

  limite?: number;
};

export type ResumoPainelAuditoria = {
  totalProcessamentos: number;

  totalProcessados: number;

  totalComAlertas: number;

  totalFalhas: number;

  totalEmAndamento: number;

  totalReprocessaveis: number;

  tempoMedioMs: number;
};