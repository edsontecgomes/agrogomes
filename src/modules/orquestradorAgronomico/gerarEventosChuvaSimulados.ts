import { criarDataSimulada } from "./criarDataSimulada";
import { criarEntradaSimuladaBase } from "./criarEntradaSimuladaBase";
import { gerarCoordenadaSimulada } from "./gerarCoordenadaSimulada";

import type {
  ConfiguracaoCenarioPiloto,
  EventoSimuladoPiloto,
} from "./typesSimulacao";

type ChuvaPlanejada = {
  diasDepois: number;

  volumeMm: number;

  indice: number;
};

const CHUVAS_PLANEJADAS:
  ChuvaPlanejada[] = [
    {
      diasDepois:
        2,

      volumeMm:
        18,

      indice:
        1,
    },
    {
      diasDepois:
        8,

      volumeMm:
        32,

      indice:
        2,
    },
    {
      diasDepois:
        18,

      volumeMm:
        24,

      indice:
        3,
    },
    {
      diasDepois:
        31,

      volumeMm:
        42,

      indice:
        4,
    },
  ];

export function gerarEventosChuvaSimulados(
  configuracao:
    ConfiguracaoCenarioPiloto,
): EventoSimuladoPiloto[] {
  return CHUVAS_PLANEJADAS.map(
    (chuva) => {
      const identificador =
        `chuva-${String(
          chuva.indice,
        ).padStart(3, "0")}`;

      const coordenada =
        gerarCoordenadaSimulada({
          centro:
            configuracao.coordenadaCentral,

          deslocamentoMetrosNorte:
            chuva.indice,

          deslocamentoMetrosLeste:
            chuva.indice,

          accuracy:
            5,
        });

      return {
        idLocal:
          `PILOTO-CHUVA-${String(
            chuva.indice,
          ).padStart(3, "0")}`,

        ordem:
          chuva.indice + 1,

        tipo:
          "chuva",

        descricao:
          `Chuva simulada de ${chuva.volumeMm} mm.`,

        entrada:
          criarEntradaSimuladaBase({
            configuracao,

            tipo:
              "chuva",

            origem:
              "pluviometro",

            dataEvento:
              criarDataSimulada(
                configuracao.dataPlantio,
                chuva.diasDepois,
                7,
              ),

            coordenada,

            identificadorEvento:
              identificador,

            payloadOriginal: {
              volumeMm:
                chuva.volumeMm,

              pluviometroId:
                "PLUV-PILOTO-001",

              pluviometroNome:
                "Pluviômetro Piloto",

              metodoMedicao:
                "manual_controlado",

              observacao:
                "Chuva gerada pelo simulador OA6.",
            },
          }),
      };
    },
  );
}