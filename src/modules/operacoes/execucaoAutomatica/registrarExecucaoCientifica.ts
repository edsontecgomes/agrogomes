import { pipelineCientifico } from "../../eventosAgronomicos/pipelineCientifico";
import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";
import { ExecucaoOrdem } from "./execucaoOrdem";
import { execucaoParaEntradaCientifica } from "./execucaoParaEntradaCientifica";

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
  const entrada = execucaoParaEntradaCientifica({
    ordem,
    execucao,
  });

  return pipelineCientifico({
    entrada,
    contexto: {
      producerId,
      farmId: ordem.farmId,
      talhaoId: ordem.talhaoId,
      ordemProgramadaId: ordem.id,
      localizacao: entrada.localizacao,
    },
  });
}