import { criarEntradaSimuladaBase } from "./criarEntradaSimuladaBase";
import { gerarCoordenadaSimulada } from "./gerarCoordenadaSimulada";

import type {
  ConfiguracaoCenarioPiloto,
  EventoSimuladoPiloto,
} from "./typesSimulacao";

export function gerarEventoPlantioSimulado(
  configuracao:
    ConfiguracaoCenarioPiloto,
): EventoSimuladoPiloto {
  const coordenada =
    gerarCoordenadaSimulada({
      centro:
        configuracao.coordenadaCentral,

      accuracy:
        6,
    });

  return {
    idLocal:
      "PILOTO-PLANTIO-001",

    ordem:
      1,

    tipo:
      "plantio",

    descricao:
      "Plantio controlado do cenário piloto.",

    entrada:
      criarEntradaSimuladaBase({
        configuracao,

        tipo:
          "plantio",

        origem:
          "operador",

        dataEvento:
          configuracao.dataPlantio,

        coordenada,

        identificadorEvento:
          "plantio-001",

        payloadOriginal: {
          tipoOperacao:
            "plantio",

          cultivar:
            configuracao.cultivar,

          populacaoPlantasHa:
            configuracao
              .populacaoPlantasHa ??
            60_000,

          sementesPorMetro:
            configuracao
              .sementesPorMetro ??
            3,

          larguraOperacionalMetros:
            configuracao
              .larguraOperacionalMetros ??
            12,

          qualidadeSemente:
            "controlada",

          loteSemente:
            "LOTE-PILOTO-001",

          observacao:
            "Evento de plantio gerado pelo simulador OA6.",
        },
      }),
  };
}