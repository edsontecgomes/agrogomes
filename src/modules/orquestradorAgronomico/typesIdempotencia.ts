import type {
  OrigemSolicitacaoAgronomica,
  RegistroEtapaAgronomica,
  StatusProcessamentoAgronomico,
} from "./types";

export type RegistroIdempotenciaAgronomica = {
  chaveIdempotencia: string;

  processamentoId: string;

  processamentoAnteriorId?: string;

  status:
    StatusProcessamentoAgronomico;

  tipoEvento: string;

  producerId: string;

  farmId: string;

  talhaoId?: string;

  eventoAgronomicoId?: string;

  resultadoCientificoId?: string;

  resultadoEstatisticoId?: string;

  aprendizadoIds?: string[];

  conhecimentoIds?: string[];

  recomendacaoIds?: string[];

  origemSolicitacao:
    OrigemSolicitacaoAgronomica;

  tentativas: number;

  etapas?: RegistroEtapaAgronomica[];

  totalAlertas?: number;

  totalErros?: number;

  iniciadoEm: string;

  finalizadoEm?: string;

  atualizadoEm: string;

  createdAt?: unknown;

  updatedAt?: unknown;
};

export type MotivoReservaIdempotencia =
  | "novo"
  | "reprocessamento"
  | "recuperacao_falha"
  | "ja_processado"
  | "em_processamento";

export type ResultadoReservaIdempotencia = {
  reservada: boolean;

  motivo: MotivoReservaIdempotencia;

  registro:
    RegistroIdempotenciaAgronomica;
};