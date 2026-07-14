import { criarEtapasProcessamento } from "./criarEtapasProcessamento";
import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

type CriarResultadoInicialParams = {
  processamentoId: string;

  chaveIdempotencia: string;

  iniciadoEm?: string;
};

export function criarResultadoInicial({
  processamentoId,
  chaveIdempotencia,
  iniciadoEm,
}: CriarResultadoInicialParams): ResultadoOrquestradorAgronomico {
  return {
    processamentoId,

    chaveIdempotencia,

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