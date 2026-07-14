import { processarESalvarRecomendacoes } from "../motorRecomendacao/processarESalvarRecomendacoes";

import type {
  ConhecimentoAgronomico,
} from "../motorConhecimento/types";

import type {
  ContextoMotoresPosteriores,
} from "./extrairContextoMotores";

type Params = {
  conhecimentos:
    ConhecimentoAgronomico[];

  contexto:
    ContextoMotoresPosteriores;
};

export async function executarMotorRecomendacaoOrquestrado({
  conhecimentos,
  contexto,
}: Params) {
  return processarESalvarRecomendacoes({
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

    areaHa:
      contexto.areaHa,

    cultivarAtual:
      contexto.cultivarAtual,

    populacaoAtual:
      contexto.populacaoAtual,

    produtividadeHistoricaScHa:
      contexto.produtividadeHistoricaScHa,

    conhecimentos,
  });
}