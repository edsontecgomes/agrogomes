import { gerarEventoColheitaSimulado } from "./gerarEventoColheitaSimulado";
import { gerarEventoPlantioSimulado } from "./gerarEventoPlantioSimulado";
import { gerarEventosChuvaSimulados } from "./gerarEventosChuvaSimulados";
import { gerarEventosOperacaoSimulados } from "./gerarEventosOperacaoSimulados";

import type {
  ConfiguracaoCenarioPiloto,
  EventoSimuladoPiloto,
} from "./typesSimulacao";

export function montarCenarioPiloto(
  configuracao:
    ConfiguracaoCenarioPiloto,
): EventoSimuladoPiloto[] {
  const eventos = [
    gerarEventoPlantioSimulado(
      configuracao,
    ),

    ...gerarEventosChuvaSimulados(
      configuracao,
    ),

    ...gerarEventosOperacaoSimulados(
      configuracao,
    ),

    gerarEventoColheitaSimulado(
      configuracao,
    ),
  ];

  return eventos.sort(
    (
      primeiro,
      segundo,
    ) =>
      primeiro.ordem -
      segundo.ordem,
  );
}