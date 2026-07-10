import { EventoAgronomicoEntrada } from "../../eventosAgronomicos/eventoEntrada";
import { OrdemProgramada } from "../ordemProgramada/ordemProgramada";
import { ExecucaoOrdem } from "./execucaoOrdem";

type Params = {
  ordem: OrdemProgramada;
  execucao: ExecucaoOrdem;
};

export function execucaoParaEntradaCientifica({
  ordem,
  execucao,
}: Params): EventoAgronomicoEntrada {
  const ultimoPonto = execucao.trajetos[execucao.trajetos.length - 1];

  return {
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