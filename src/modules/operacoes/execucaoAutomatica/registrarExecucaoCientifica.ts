import { pipelineCientifico } from "../../eventosAgronomicos/pipelineCientifico";

import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";
import { ExecucaoOrdem } from "./execucaoOrdem";
import { execucaoParaEntradaCientifica } from "./execucaoParaEntradaCientifica";
import { resolverContextoExecucaoEspacial } from "./resolverContextoExecucaoEspacial";

type Params = {
  producerId: string;
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export async function registrarExecucaoCientifica({
  producerId,
  ordem,
  execucao,
}: Params) {
  const entrada =
    execucaoParaEntradaCientifica({
      ordem,
      execucao,
    });

  const contexto =
    await resolverContextoExecucaoEspacial({
      producerId,
      ordem,
      execucao,
    });

  return pipelineCientifico({
    entrada: {
      ...entrada,

      payloadOriginal: {
        ...entrada.payloadOriginal,

        resolucaoTrajeto: {
          totalPontos:
            execucao.trajetos.length,

          ordemProgramadaId:
            ordem.id,

          talhaoId:
            ordem.talhaoId,

          larguraOperacionalMetros:
            ordem.larguraOperacionalMetros,
        },
      },
    },

    contexto,
  });
}