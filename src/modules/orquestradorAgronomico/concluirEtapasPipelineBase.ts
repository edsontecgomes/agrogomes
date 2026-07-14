import { atualizarEtapaProcessamento } from "./atualizarEtapaProcessamento";
import type {
  ResultadoOrquestradorAgronomico,
} from "./types";

export function concluirEtapasPipelineBase(
  resultado: ResultadoOrquestradorAgronomico,
): ResultadoOrquestradorAgronomico {
  let etapas =
    resultado.etapas;

  etapas =
    atualizarEtapaProcessamento({
      etapas,

      etapa:
        "contexto_agronomico",

      status:
        "concluida",

      mensagem:
        "Contexto Agronômico resolvido pelo pipeline-base.",
    });

  etapas =
    atualizarEtapaProcessamento({
      etapas,

      etapa:
        "registro_evento",

      status:
        "concluida",

      mensagem:
        "Evento Agronômico registrado no Firestore.",
    });

  etapas =
    atualizarEtapaProcessamento({
      etapas,

      etapa:
        "timeline",

      status:
        "concluida",

      mensagem:
        "Evento registrado na Timeline Agronômica.",
    });

  return {
    ...resultado,

    etapas,
  };
}