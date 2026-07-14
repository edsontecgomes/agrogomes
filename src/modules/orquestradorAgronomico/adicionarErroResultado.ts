import type {
  ErroProcessamentoAgronomico,
  ResultadoOrquestradorAgronomico,
} from "./types";

export function adicionarErroResultado(
  resultado: ResultadoOrquestradorAgronomico,
  erro: ErroProcessamentoAgronomico,
): ResultadoOrquestradorAgronomico {
  return {
    ...resultado,

    erros: [
      ...resultado.erros,
      erro,
    ],
  };
}