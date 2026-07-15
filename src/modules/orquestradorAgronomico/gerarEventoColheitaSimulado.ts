import { criarDataSimulada } from "./criarDataSimulada";
import { criarEntradaSimuladaBase } from "./criarEntradaSimuladaBase";
import { gerarCoordenadaSimulada } from "./gerarCoordenadaSimulada";

import type {
  ConfiguracaoCenarioPiloto,
  EventoSimuladoPiloto,
} from "./typesSimulacao";

export function gerarEventoColheitaSimulado(
  configuracao:
    ConfiguracaoCenarioPiloto,
): EventoSimuladoPiloto {
  const produtividade =
    configuracao
      .produtividadeEsperadaScHa ??
    62;

  const coordenada =
    gerarCoordenadaSimulada({
      centro:
        configuracao.coordenadaCentral,

      deslocamentoMetrosNorte:
        5,

      deslocamentoMetrosLeste:
        18,

      accuracy:
        6,
    });

  return {
    idLocal:
      "PILOTO-COLHEITA-001",

    ordem:
      8,

    tipo:
      "colheita",

    descricao:
      "Colheita e produtividade simuladas.",

    entrada:
      criarEntradaSimuladaBase({
        configuracao,

        tipo:
          "colheita",

        origem:
          "telemetria",

        dataEvento:
          criarDataSimulada(
            configuracao.dataPlantio,
            125,
            11,
          ),

        coordenada,

        identificadorEvento:
          "colheita-001",

        payloadOriginal: {
          tipoOperacao:
            "colheita",

          cultivar:
            configuracao.cultivar,

          produtividadeScHa:
            produtividade,

          umidadeGraosPercentual:
            14.2,

          perdasColheitaScHa:
            1.1,

          areaHa:
            1,

          observacao:
            "Colheita simulada pelo OA6.",

          comparacoesCientificas: [
            {
              fator:
                "manejo_piloto",

              antes:
                produtividade - 6,

              depois:
                produtividade,

              titulo:
                "Resposta produtiva do manejo piloto",

              descricao:
                "Comparação controlada para testar o Motor Científico.",
            },
          ],

          fatoresImpacto: [
            {
              fator:
                "chuva_distribuicao",

              impactoScHa:
                2.5,
            },
            {
              fator:
                "adubacao_cobertura",

              impactoScHa:
                3.5,
            },
          ],
        },
      }),
  };
}