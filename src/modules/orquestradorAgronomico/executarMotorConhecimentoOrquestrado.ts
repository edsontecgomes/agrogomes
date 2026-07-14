import { processarESalvarConhecimento } from "../motorConhecimento/processarESalvarConhecimento";

import type {
  ResultadoMotorAprendizagem,
} from "../motorAprendizagem/types";

export async function executarMotorConhecimentoOrquestrado(
  resultadoAprendizagem: ResultadoMotorAprendizagem,
) {
  return processarESalvarConhecimento(
    resultadoAprendizagem.aprendizados,
  );
}