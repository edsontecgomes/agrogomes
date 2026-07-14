import type {
  ResultadoMotorCientificoCompleto,
} from "../ciencia/typesMotorCientifico";

import { processarMotorAprendizagem } from "../motorAprendizagem/processarMotorAprendizagem";
import { salvarAprendizados } from "../motorAprendizagem/salvarAprendizados";

import type {
  ResultadoEstatisticoEventos,
} from "../motorEstatistico/processarEventosAgronomicos";

import type {
  ContextoMotoresPosteriores,
} from "./extrairContextoMotores";

import type {
  ResultadoAprendizagemOrquestrado,
} from "./typesMotoresOrquestrados";

type Params = {
  resultadoCientifico:
    ResultadoMotorCientificoCompleto;

  resultadoEstatistico?:
    ResultadoEstatisticoEventos;

  contexto:
    ContextoMotoresPosteriores;
};

export async function executarMotorAprendizagemOrquestrado({
  resultadoCientifico,
  resultadoEstatistico,
  contexto,
}: Params): Promise<ResultadoAprendizagemOrquestrado> {
  const resultado =
    processarMotorAprendizagem({
      resultadoCientifico,

      resultadoEstatistico,

      producerId:
        contexto.producerId,

      farmId:
        contexto.farmId,

      talhaoId:
        contexto.talhaoId,

      ueiId:
        contexto.ueiId,

      gdaId:
        contexto.gdaId,

      safraId:
        contexto.safraId,

      cultura:
        contexto.cultura,
    });

  const aprendizadoIds =
    await salvarAprendizados(
      resultado,
    );

  return {
    aprendizadoIds,

    resultado,
  };
}