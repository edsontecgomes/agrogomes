import { montarCenarioPiloto } from "./montarCenarioPiloto";
import { processarEventoAgronomicoCompleto } from "./processarEventoAgronomicoCompleto";

import type {
  ConfiguracaoCenarioPiloto,
  ResultadoCenarioPiloto,
  ResultadoEventoSimulado,
} from "./typesSimulacao";

function gerarCenarioId(
  configuracao:
    ConfiguracaoCenarioPiloto,
): string {
  return [
    "CENARIO",
    configuracao.farmId,
    configuracao.talhaoId,
    configuracao.safraId,
  ].join("-");
}

export async function executarCenarioPiloto(
  configuracao:
    ConfiguracaoCenarioPiloto,
): Promise<ResultadoCenarioPiloto> {
  const iniciadoEm =
    new Date().toISOString();

  const eventos =
    montarCenarioPiloto(
      configuracao,
    );

  const resultados:
    ResultadoEventoSimulado[] = [];

  for (const evento of eventos) {
    const processamento =
      await processarEventoAgronomicoCompleto(
        evento.entrada,
      );

    resultados.push({
      idLocal:
        evento.idLocal,

      ordem:
        evento.ordem,

      tipo:
        evento.tipo,

      descricao:
        evento.descricao,

      sucesso:
        processamento.status ===
          "processado" ||
        processamento.status ===
          "processado_com_alertas",

      processamento,
    });

    if (
      processamento.status ===
      "falhou"
    ) {
      break;
    }
  }

  const finalizadoEm =
    new Date().toISOString();

  return {
    cenarioId:
      gerarCenarioId(
        configuracao,
      ),

    configuracao,

    totalEventos:
      resultados.length,

    totalSucessos:
      resultados.filter(
        (resultado) =>
          resultado.processamento
            .status ===
          "processado",
      ).length,

    totalComAlertas:
      resultados.filter(
        (resultado) =>
          resultado.processamento
            .status ===
          "processado_com_alertas",
      ).length,

    totalFalhas:
      resultados.filter(
        (resultado) =>
          resultado.processamento
            .status ===
          "falhou",
      ).length,

    resultados,

    iniciadoEm,

    finalizadoEm,

    duracaoTotalMs:
      Math.max(
        0,
        Date.parse(finalizadoEm) -
          Date.parse(iniciadoEm),
      ),
  };
}