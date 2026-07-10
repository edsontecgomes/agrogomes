import { registrarEventoComQualidade } from "../../eventosAgronomicos/registrarEventoComQualidade";
import { ExecucaoOrdem } from "./execucaoOrdem";
import { execucaoParaEventoAgronomico } from "./execucaoParaEventoAgronomico";
import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";

type Params = {
  producerId: string;
  farmId: string;
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export async function registrarExecucaoAgronomica(params: Params) {
  const evento = execucaoParaEventoAgronomico(params);

  return registrarEventoComQualidade(evento);
}