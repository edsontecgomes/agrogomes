import { ResolverContextoParams } from "../../contextoAgronomico/types";
import { resolverGDAsPorUEIs } from "../../motorEspacial/resolverGDAsPorUEIs";
import { resolverUEIsPorTrajeto } from "../../motorEspacial/resolverUEIsPorTrajeto";

import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";
import { ExecucaoOrdem } from "./execucaoOrdem";

type Params = {
  producerId: string;
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export async function resolverContextoExecucaoEspacial({
  producerId,
  ordem,
  execucao,
}: Params): Promise<ResolverContextoParams> {
  const ultimoPonto =
    execucao.trajetos[
      execucao.trajetos.length - 1
    ];

  const resultadoTrajeto =
    await resolverUEIsPorTrajeto({
      farmId: ordem.farmId,
      talhaoId: ordem.talhaoId,
      trajetos: execucao.trajetos.map(
        (ponto) => ({
          lat: ponto.lat,
          lng: ponto.lng,
          accuracy: ponto.precisao,
          timestamp: ponto.timestamp,
        }),
      ),
    });

  const resultadoGDA =
    await resolverGDAsPorUEIs(
      resultadoTrajeto.ueiIds,
    );

  return {
    producerId,
    farmId: ordem.farmId,
    talhaoId: ordem.talhaoId,
    ordemProgramadaId: ordem.id,

    localizacao: ultimoPonto
      ? {
          lat: ultimoPonto.lat,
          lng: ultimoPonto.lng,
          accuracy: ultimoPonto.precisao,
        }
      : undefined,

    ueiIdsResolvidos:
      resultadoTrajeto.ueiIds,

    gdaIdsResolvidos:
      resultadoGDA.gdaIds,

    metodoResolucaoEspacial:
      resultadoTrajeto.metodo,

    confiabilidadeEspacial:
      resultadoTrajeto.confiabilidade,

    observacoesEspaciais: [
      ...resultadoTrajeto.observacoes,
      ...resultadoGDA.observacoes,
      `Trajeto recebido com ${resultadoTrajeto.totalPontosRecebidos} ponto(s).`,
      `Trajeto validado com ${resultadoTrajeto.totalPontosValidos} ponto(s).`,
      `${resultadoTrajeto.totalUEIsPercorridas} UEI(s) identificada(s) na execução.`,
    ],
  };
}