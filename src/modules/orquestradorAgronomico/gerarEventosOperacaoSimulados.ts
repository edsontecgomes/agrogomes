import { criarDataSimulada } from "./criarDataSimulada";
import { criarEntradaSimuladaBase } from "./criarEntradaSimuladaBase";
import { gerarCoordenadaSimulada } from "./gerarCoordenadaSimulada";

import type {
  ConfiguracaoCenarioPiloto,
  EventoSimuladoPiloto,
} from "./typesSimulacao";

export function gerarEventosOperacaoSimulados(
  configuracao:
    ConfiguracaoCenarioPiloto,
): EventoSimuladoPiloto[] {
  const coordenadaAdubacao =
    gerarCoordenadaSimulada({
      centro:
        configuracao.coordenadaCentral,

      deslocamentoMetrosNorte:
        12,

      deslocamentoMetrosLeste:
        -8,

      accuracy:
        7,
    });

  const coordenadaPulverizacao =
    gerarCoordenadaSimulada({
      centro:
        configuracao.coordenadaCentral,

      deslocamentoMetrosNorte:
        -15,

      deslocamentoMetrosLeste:
        10,

      accuracy:
        8,
    });

  return [
    {
      idLocal:
        "PILOTO-ADUBACAO-001",

      ordem:
        6,

      tipo:
        "adubacao",

      descricao:
        "Adubação de cobertura simulada.",

      entrada:
        criarEntradaSimuladaBase({
          configuracao,

          tipo:
            "adubacao",

          origem:
            "operador",

          dataEvento:
            criarDataSimulada(
              configuracao.dataPlantio,
              22,
              9,
            ),

          coordenada:
            coordenadaAdubacao,

          identificadorEvento:
            "adubacao-001",

          payloadOriginal: {
            tipoOperacao:
              "adubacao",

            produto:
              "UREIA-PILOTO",

            doseKgHa:
              150,

            nitrogenioKgHa:
              67.5,

            larguraOperacionalMetros:
              configuracao
                .larguraOperacionalMetros ??
              12,

            observacao:
              "Adubação simulada pelo OA6.",
          },
        }),
    },
    {
      idLocal:
        "PILOTO-PULVERIZACAO-001",

      ordem:
        7,

      tipo:
        "pulverizacao",

      descricao:
        "Pulverização simulada do cenário piloto.",

      entrada:
        criarEntradaSimuladaBase({
          configuracao,

          tipo:
            "pulverizacao",

          origem:
            "operador",

          dataEvento:
            criarDataSimulada(
              configuracao.dataPlantio,
              36,
              10,
            ),

          coordenada:
            coordenadaPulverizacao,

          identificadorEvento:
            "pulverizacao-001",

          payloadOriginal: {
            tipoOperacao:
              "pulverizacao",

            produto:
              "PRODUTO-PILOTO",

            doseLHa:
              1.5,

            volumeCaldaLHa:
              120,

            larguraOperacionalMetros:
              configuracao
                .larguraOperacionalMetros ??
              24,

            observacao:
              "Pulverização simulada pelo OA6.",
          },
        }),
    },
  ];
}