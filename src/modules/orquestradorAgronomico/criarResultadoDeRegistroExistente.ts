import { criarEtapasProcessamento } from "./criarEtapasProcessamento";

import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

import type {
  RegistroIdempotenciaAgronomica,
} from "./typesIdempotencia";

export function criarResultadoDeRegistroExistente(
  registro: RegistroIdempotenciaAgronomica,
): ResultadoOrquestradorAgronomico {
  return {
    processamentoId:
      registro.processamentoId,

    processamentoAnteriorId:
      registro.processamentoAnteriorId,

    chaveIdempotencia:
      registro.chaveIdempotencia,

    idempotenciaReutilizada:
      true,

    tentativas:
      registro.tentativas,

    status:
      registro.status,

    eventoAgronomicoId:
      registro.eventoAgronomicoId,

    resultadoCientificoId:
      registro.resultadoCientificoId,

    resultadoEstatisticoId:
      registro.resultadoEstatisticoId,

    aprendizadoIds:
      registro.aprendizadoIds ?? [],

    conhecimentoIds:
      registro.conhecimentoIds ?? [],

    recomendacaoIds:
      registro.recomendacaoIds ?? [],

    etapas:
      registro.etapas ??
      criarEtapasProcessamento(),

    registros: [],

    alertas:
      registro.status ===
      "processando"
        ? [
            "Este evento já possui um processamento em andamento.",
          ]
        : [
            "O resultado existente foi reutilizado e nenhum evento duplicado foi criado.",
          ],

    erros: [],

    iniciadoEm:
      registro.iniciadoEm,

    finalizadoEm:
      registro.finalizadoEm,

    duracaoTotalMs:
      registro.finalizadoEm
        ? Math.max(
            0,
            Date.parse(
              registro.finalizadoEm,
            ) -
              Date.parse(
                registro.iniciadoEm,
              ),
          )
        : undefined,
  };
}