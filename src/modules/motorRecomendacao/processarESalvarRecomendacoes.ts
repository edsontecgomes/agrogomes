import { processarMotorRecomendacao } from "./processarMotorRecomendacao";
import { salvarRecomendacoes } from "./salvarRecomendacoes";
import type {
  ContextoRecomendacao,
  ResultadoMotorRecomendacao,
} from "./types";

export type ResultadoRecomendacoesPersistidas = {
  recomendacaoIds: string[];

  resultado:
    ResultadoMotorRecomendacao;
};

export async function processarESalvarRecomendacoes(
  contexto: ContextoRecomendacao,
): Promise<ResultadoRecomendacoesPersistidas> {
  const resultado =
    processarMotorRecomendacao(
      contexto,
    );

  const recomendacaoIds =
    await salvarRecomendacoes(
      resultado,
    );

  return {
    recomendacaoIds,

    resultado,
  };
}