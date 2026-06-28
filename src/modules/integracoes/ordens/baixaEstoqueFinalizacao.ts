import { gerarBaixasPorOrdem } from "../../operacoes/estoqueOperacional/baixaPorOrdem";
import { FinalizacaoOrdem } from "./finalizacaoOrdem";

export function gerarBaixaEstoqueDaFinalizacao(finalizacao: FinalizacaoOrdem) {
  return gerarBaixasPorOrdem(
    finalizacao.farmId,
    finalizacao.ordemProgramadaId,
    finalizacao.itensConsumidos.map((item) => ({
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      quantidade: item.quantidade,
      unidade: item.unidade,
    })),
  );
}