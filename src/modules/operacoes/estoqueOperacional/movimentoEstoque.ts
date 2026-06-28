export type TipoMovimentoEstoque = "entrada" | "saida" | "ajuste";

export type MovimentoEstoqueOperacional = {
  id: string;
  farmId: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoMovimentoEstoque;
  quantidade: number;
  unidade: string;
  data: string;
  origem?: "manual" | "ordem_servico" | "inventario";
  referenciaId?: string;
};

export function criarMovimentoEstoque(
  params: Omit<MovimentoEstoqueOperacional, "data"> & { data?: string },
): MovimentoEstoqueOperacional {
  return {
    ...params,
    data: params.data || new Date().toISOString(),
  };
}