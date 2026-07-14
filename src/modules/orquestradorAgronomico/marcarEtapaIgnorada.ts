import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";

import type {
  NomeEtapaAgronomica,
  ResultadoOrquestradorAgronomico,
} from "./types";

export function marcarEtapaIgnorada(
  resultado: ResultadoOrquestradorAgronomico,
  etapa: NomeEtapaAgronomica,
  mensagem: string,
): ResultadoOrquestradorAgronomico {
  return {
    ...resultado,

    etapas:
      atualizarEtapaProcessamento({
        etapas:
          resultado.etapas,

        etapa,

        status:
          "ignorada",

        mensagem,
      }),
  };
}