import { UsoProdutoTalhao } from "../../operacoes/estoqueOperacional/usoProdutoTalhao";
import { FinalizacaoOrdem } from "./finalizacaoOrdem";

export function gerarUsosTalhaoDaFinalizacao(
  finalizacao: FinalizacaoOrdem,
): UsoProdutoTalhao[] {
  return finalizacao.itensConsumidos.map((item, index) => ({
    id: `${finalizacao.ordemProgramadaId}-USO-${index + 1}`,
    farmId: finalizacao.farmId,
    talhaoId: finalizacao.talhaoId,
    ordemProgramadaId: finalizacao.ordemProgramadaId,
    produtoId: item.produtoId,
    produtoNome: item.produtoNome,
    quantidade: item.quantidade,
    unidade: item.unidade,
    areaHa: finalizacao.areaExecutadaHa,
    lote: item.lote,
    data: finalizacao.dataFinalizacao,
  }));
}