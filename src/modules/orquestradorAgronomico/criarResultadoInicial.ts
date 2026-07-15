import { criarEtapasProcessamento } from "./criarEtapasProcessamento";

import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

type CriarResultadoInicialParams = {
  processamentoId: string;

  chaveIdempotencia: string;

  iniciadoEm?: string;

  tentativas?: number;

  processamentoAnteriorId?: string;
};

export function criarResultadoInicial({
  processamentoId,
  chaveIdempotencia,
  iniciadoEm,
  tentativas = 1,
  processamentoAnteriorId,
}: CriarResultadoInicialParams): ResultadoOrquestradorAgronomico {
  return {
    processamentoId,

    processamentoAnteriorId,

    chaveIdempotencia,

    idempotenciaReutilizada:
      false,

    tentativas,

    status:
      "recebido",

    aprendizadoIds: [],

    conhecimentoIds: [],

    recomendacaoIds: [],

    etapas:
      criarEtapasProcessamento(),

    registros: [],

    alertas: [],

    erros: [],

    iniciadoEm:
      iniciadoEm ??
      new Date().toISOString(),
  };
}