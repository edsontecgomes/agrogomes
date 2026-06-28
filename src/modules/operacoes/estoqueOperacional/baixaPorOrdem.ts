import { MovimentoEstoqueOperacional } from "./movimentoEstoque";

export type ItemBaixaOrdem = {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
};

export function gerarBaixasPorOrdem(
  farmId: string,
  ordemProgramadaId: string,
  itens: ItemBaixaOrdem[],
): MovimentoEstoqueOperacional[] {
  return itens.map((item, index) => ({
    id: `${ordemProgramadaId}-BAIXA-${index + 1}`,
    farmId,
    produtoId: item.produtoId,
    produtoNome: item.produtoNome,
    tipo: "saida",
    quantidade: item.quantidade,
    unidade: item.unidade,
    data: new Date().toISOString(),
    origem: "ordem_servico",
    referenciaId: ordemProgramadaId,
  }));
}