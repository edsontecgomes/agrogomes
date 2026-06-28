export type RastreabilidadeInsumo = {
  produtoId: string;
  produtoNome: string;
  lote?: string;
  farmId: string;
  talhaoId?: string;
  hectareIds?: string[];
  ordemProgramadaId?: string;
  dataUso: string;
};

export function criarRastreabilidadeInsumo(
  params: Omit<RastreabilidadeInsumo, "dataUso"> & { dataUso?: string },
): RastreabilidadeInsumo {
  return {
    ...params,
    dataUso: params.dataUso || new Date().toISOString(),
  };
}