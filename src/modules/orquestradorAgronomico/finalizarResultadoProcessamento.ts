import type {
  ResultadoOrquestradorAgronomico,
  StatusProcessamentoAgronomico,
} from "./types";

type FinalizarResultadoParams = {
  resultado: ResultadoOrquestradorAgronomico;

  status?: StatusProcessamentoAgronomico;
};

export function finalizarResultadoProcessamento({
  resultado,
  status,
}: FinalizarResultadoParams): ResultadoOrquestradorAgronomico {
  const finalizadoEm =
    new Date().toISOString();

  let statusFinal = status;

  if (!statusFinal) {
    if (resultado.erros.length > 0) {
      statusFinal =
        resultado.evento
          ? "processado_com_alertas"
          : "falhou";
    } else if (
      resultado.alertas.length > 0
    ) {
      statusFinal =
        "processado_com_alertas";
    } else {
      statusFinal =
        "processado";
    }
  }

  return {
    ...resultado,

    status:
      statusFinal,

    finalizadoEm,

    duracaoTotalMs: Math.max(
      0,
      Date.parse(finalizadoEm) -
        Date.parse(
          resultado.iniciadoEm,
        ),
    ),
  };
}