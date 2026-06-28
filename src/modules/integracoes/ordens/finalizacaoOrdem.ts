export type ItemConsumidoOrdem = {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  lote?: string;
};

export type FinalizacaoOrdem = {
  ordemProgramadaId: string;
  farmId: string;
  talhaoId: string;
  safra: string;
  tipoOperacao: "plantio" | "pulverizacao" | "adubacao" | "colheita" | "outro";
  areaExecutadaHa?: number;
  itensConsumidos: ItemConsumidoOrdem[];
  dataFinalizacao: string;
};

export function criarFinalizacaoOrdem(
  params: Omit<FinalizacaoOrdem, "dataFinalizacao"> & { dataFinalizacao?: string },
): FinalizacaoOrdem {
  return {
    ...params,
    dataFinalizacao: params.dataFinalizacao || new Date().toISOString(),
  };
}