import { EventoAgronomico } from "../../eventosAgronomicos/types";
import { ExecucaoOrdem } from "./execucaoOrdem";
import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";

type Params = {
  producerId: string;
  farmId: string;
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export function execucaoParaEventoAgronomico({
  producerId,
  farmId,
  ordem,
  execucao,
}: Params): Omit<
  EventoAgronomico,
  "id" | "createdAt" | "updatedAt" | "qualidadeDado"
> {
  const ultimoPonto = execucao.trajetos[execucao.trajetos.length - 1];

  return {
    producerId,
    farmId,
    talhaoId: ordem.talhaoId,
    tipo: "execucao_ordem",
    origem: "operador",
    dataEvento: execucao.fim || execucao.inicio || new Date().toISOString(),
    responsavelId: execucao.operadorId,
    localizacao: ultimoPonto
      ? {
          lat: ultimoPonto.lat,
          lng: ultimoPonto.lng,
          accuracy: ultimoPonto.precisao,
        }
      : undefined,
    payloadOriginal: {
      ordemProgramadaId: ordem.id,
      tipoOperacao: ordem.tipoOperacao,
      safra: ordem.safra,
      statusExecucao: execucao.status,
      inicio: execucao.inicio,
      fim: execucao.fim,
      trajetos: execucao.trajetos,
      cultivar: ordem.cultivar,
      loteSemente: ordem.loteSemente,
      sementesPorMetro: ordem.sementesPorMetro,
      produtosPlanejados: ordem.produtosPlanejados,
      implementoPlanejado: ordem.implementoPlanejado,
      larguraOperacionalMetros: ordem.larguraOperacionalMetros,
    },
  };
}