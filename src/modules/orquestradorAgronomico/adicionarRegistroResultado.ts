import type {
  RegistroProcessamentoAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

export function adicionarRegistroResultado(
  resultado: ResultadoOrquestradorAgronomico,
  registro: RegistroProcessamentoAgronomico,
): ResultadoOrquestradorAgronomico {
  return {
    ...resultado,

    registros: [
      ...resultado.registros,
      registro,
    ],
  };
}