import type {
  ResolverContextoParams,
} from "../contextoAgronomico/types";

import type {
  EventoAgronomicoEntrada,
} from "../eventosAgronomicos/eventoEntrada";

import type {
  EventoAgronomico,
} from "../eventosAgronomicos/types";

export type StatusProcessamentoAgronomico =
  | "recebido"
  | "validando"
  | "processando"
  | "processado"
  | "processado_com_alertas"
  | "falhou"
  | "cancelado";

export type NomeEtapaAgronomica =
  | "recepcao"
  | "validacao"
  | "idempotencia"
  | "registro_evento"
  | "contexto_agronomico"
  | "timeline"
  | "motor_cientifico"
  | "motor_estatistico"
  | "motor_aprendizagem"
  | "motor_conhecimento"
  | "motor_recomendacao"
  | "auditoria"
  | "finalizacao";

export type StatusEtapaAgronomica =
  | "pendente"
  | "processando"
  | "concluida"
  | "concluida_com_alertas"
  | "ignorada"
  | "falhou";

export type SeveridadeRegistro =
  | "informacao"
  | "alerta"
  | "erro"
  | "critico";

export type OrigemSolicitacaoAgronomica =
  | "interface"
  | "sincronizacao"
  | "reprocessamento"
  | "sistema"
  | "teste";

export type ObrigatoriedadeEtapa =
  | "obrigatoria"
  | "opcional";

export type EntradaOrquestradorAgronomico = {
  entrada: EventoAgronomicoEntrada;

  contexto: ResolverContextoParams;

  chaveIdempotencia?: string;

  origemSolicitacao?:
    OrigemSolicitacaoAgronomica;

  permitirReprocessamento?: boolean;

  etapaRetomada?:
    NomeEtapaAgronomica;

  processarEstatistica?: boolean;

  processarAprendizado?: boolean;

  processarConhecimento?: boolean;

  processarRecomendacao?: boolean;

  propriedades?: Record<string, unknown>;
};

export type RegistroEtapaAgronomica = {
  etapa: NomeEtapaAgronomica;

  status: StatusEtapaAgronomica;

  obrigatoriedade?: ObrigatoriedadeEtapa;

  inicioEm?: string;

  fimEm?: string;

  duracaoMs?: number;

  tentativas?: number;

  mensagem?: string;

  detalhes?: Record<string, unknown>;
};

export type RegistroProcessamentoAgronomico = {
  id: string;

  processamentoId: string;

  etapa?: NomeEtapaAgronomica;

  severidade: SeveridadeRegistro;

  codigo: string;

  mensagem: string;

  detalhes?: Record<string, unknown>;

  criadoEm: string;
};

export type ErroProcessamentoAgronomico = {
  etapa?: NomeEtapaAgronomica;

  codigo: string;

  mensagem: string;

  erroOriginal?: unknown;

  recuperavel: boolean;

  criadoEm: string;
};

export type ResultadoOrquestradorAgronomico = {
  processamentoId: string;

  processamentoAnteriorId?: string;

  chaveIdempotencia: string;

  idempotenciaReutilizada: boolean;

  tentativas: number;

  status: StatusProcessamentoAgronomico;

  evento?: EventoAgronomico;

  eventoAgronomicoId?: string;

  resultadoCientificoId?: string;

  resultadoEstatisticoId?: string;

  aprendizadoIds: string[];

  conhecimentoIds: string[];

  recomendacaoIds: string[];

  etapas: RegistroEtapaAgronomica[];

  registros: RegistroProcessamentoAgronomico[];

  alertas: string[];

  erros: ErroProcessamentoAgronomico[];

  ultimaEtapaConcluida?:
    NomeEtapaAgronomica;

  etapaComFalha?:
    NomeEtapaAgronomica;

  iniciadoEm: string;

  finalizadoEm?: string;

  duracaoTotalMs?: number;
};