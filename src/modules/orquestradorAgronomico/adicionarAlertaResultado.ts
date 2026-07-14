import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

export function adicionarAlertaResultado(
  resultado: ResultadoOrquestradorAgronomico,
  alerta: string,
): ResultadoOrquestradorAgronomico {
  const alertaNormalizado =
    alerta.trim();

  if (
    !alertaNormalizado ||
    resultado.alertas.includes(
      alertaNormalizado,
    )
  ) {
    return resultado;
  }

  return {
    ...resultado,

    alertas: [
      ...resultado.alertas,
      alertaNormalizado,
    ],
  };
}

export function adicionarAlertasResultado(
  resultado: ResultadoOrquestradorAgronomico,
  alertas: string[],
): ResultadoOrquestradorAgronomico {
  return alertas.reduce(
    (
      resultadoAtual,
      alerta,
    ) =>
      adicionarAlertaResultado(
        resultadoAtual,
        alerta,
      ),
    resultado,
  );
}