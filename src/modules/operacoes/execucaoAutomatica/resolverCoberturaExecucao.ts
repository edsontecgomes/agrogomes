import { calcularCoberturaOperacional } from "../../motorEspacial/calcularCoberturaOperacional";
import { ResultadoCoberturaOperacional } from "../../motorEspacial/typesCobertura";

import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";
import { ExecucaoOrdem } from "./execucaoOrdem";

type Params = {
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export async function resolverCoberturaExecucao({
  ordem,
  execucao,
}: Params): Promise<ResultadoCoberturaOperacional> {
  return calcularCoberturaOperacional({
    farmId: ordem.farmId,

    talhaoId: ordem.talhaoId,

    larguraOperacionalMetros:
      ordem.larguraOperacionalMetros ?? 0,

    trajetos: execucao.trajetos.map(
      (ponto) => ({
        lat: ponto.lat,
        lng: ponto.lng,
        accuracy: ponto.precisao,
        timestamp: ponto.timestamp,
      }),
    ),
  });
}