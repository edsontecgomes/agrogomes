import { pipelineCientifico } from "../../eventosAgronomicos/pipelineCientifico";
import { resolverGDAsPorUEIs } from "../../motorEspacial/resolverGDAsPorUEIs";

import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";

import { criarPayloadCoberturaExecucao } from "./criarPayloadCoberturaExecucao";
import { ExecucaoOrdem } from "./execucaoOrdem";
import { execucaoParaEntradaCientifica } from "./execucaoParaEntradaCientifica";
import { resolverCoberturaExecucao } from "./resolverCoberturaExecucao";
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

  const contextoBase =
    await resolverContextoExecucaoEspacial({
      producerId,
      ordem,
      execucao,
    });

  const cobertura =
    await resolverCoberturaExecucao({
      ordem,
      execucao,
    });

  const gdasCobertura =
    await resolverGDAsPorUEIs(
      cobertura.ueiIds,
    );

  const contexto = {
    ...contextoBase,

    ueiIdsResolvidos:
      cobertura.ueiIds.length > 0
        ? cobertura.ueiIds
        : contextoBase.ueiIdsResolvidos,

    gdaIdsResolvidos:
      gdasCobertura.gdaIds.length > 0
        ? gdasCobertura.gdaIds
        : contextoBase.gdaIdsResolvidos,

    metodoResolucaoEspacial:
      cobertura.metodo,

    confiabilidadeEspacial:
      cobertura.confiabilidade,

    observacoesEspaciais: [
      ...(contextoBase.observacoesEspaciais ??
        []),

      ...cobertura.observacoes,

      ...gdasCobertura.observacoes,
    ],
  };

  return pipelineCientifico({
    entrada: {
      ...entrada,

      payloadOriginal: {
        ...entrada.payloadOriginal,

        coberturaOperacional:
          criarPayloadCoberturaExecucao(
            cobertura,
          ),
      },
    },

    contexto,
  });
}