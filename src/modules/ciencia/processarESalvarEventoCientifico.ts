import { EventoAgronomico } from "../eventosAgronomicos/types";

import { processarEventoNoMotorCientifico } from "./processarEventoNoMotorCientifico";
import { salvarResultadoMotorCientifico } from "./salvarResultadoMotorCientifico";
import { ResultadoMotorCientificoCompleto } from "./typesMotorCientifico";

export type ResultadoProcessamentoPersistido = {
  resultadoId: string;

  resultado:
    ResultadoMotorCientificoCompleto;
};

export async function processarESalvarEventoCientifico(
  evento: EventoAgronomico,
): Promise<ResultadoProcessamentoPersistido> {
  const resultado =
    processarEventoNoMotorCientifico(
      evento,
    );

  const resultadoId =
    await salvarResultadoMotorCientifico(
      resultado,
    );

  return {
    resultadoId,
    resultado,
  };
}