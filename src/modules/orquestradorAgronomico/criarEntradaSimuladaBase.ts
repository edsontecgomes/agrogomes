import type {
  OrigemEventoAgronomico,
  TipoEventoAgronomico,
} from "../eventosAgronomicos/types";

import type {
  EntradaOrquestradorAgronomico,
} from "./types";

import type {
  ConfiguracaoCenarioPiloto,
  CoordenadaSimulada,
} from "./typesSimulacao";

type CriarEntradaSimuladaBaseParams = {
  configuracao:
    ConfiguracaoCenarioPiloto;

  tipo:
    TipoEventoAgronomico;

  origem:
    OrigemEventoAgronomico;

  dataEvento: string;

  coordenada?:
    CoordenadaSimulada;

  identificadorEvento: string;

  payloadOriginal:
    Record<string, unknown>;
};

export function criarEntradaSimuladaBase({
  configuracao,
  tipo,
  origem,
  dataEvento,
  coordenada,
  identificadorEvento,
  payloadOriginal,
}: CriarEntradaSimuladaBaseParams): EntradaOrquestradorAgronomico {
  return {
    entrada: {
      tipo,

      origem,

      dataEvento,

      responsavelId:
        configuracao.responsavelId,

      localizacao:
        coordenada,

      payloadOriginal: {
        ...payloadOriginal,

        simulacao: {
          ativa:
            true,

          identificadorEvento,

          safraId:
            configuracao.safraId,

          cultura:
            configuracao.cultura,

          geradoEm:
            new Date().toISOString(),
        },

        safraId:
          configuracao.safraId,

        cultura:
          configuracao.cultura,
      },
    },

    contexto: {
      producerId:
        configuracao.producerId,

      farmId:
        configuracao.farmId,

      talhaoId:
        configuracao.talhaoId,

      localizacao:
        coordenada,

      dataReferencia:
        dataEvento,
    },

    chaveIdempotencia: [
      "PILOTO",
      configuracao.farmId,
      configuracao.talhaoId,
      configuracao.safraId,
      identificadorEvento,
    ].join("-"),

    origemSolicitacao:
      "teste",

    permitirReprocessamento:
      false,

    processarEstatistica:
      configuracao.processarEstatistica ??
      true,

    processarAprendizado:
      configuracao.processarAprendizado ??
      true,

    processarConhecimento:
      configuracao.processarConhecimento ??
      true,

    processarRecomendacao:
      configuracao.processarRecomendacao ??
      true,

    propriedades: {
      cenarioPiloto:
        true,

      identificadorEvento,
    },
  };
}