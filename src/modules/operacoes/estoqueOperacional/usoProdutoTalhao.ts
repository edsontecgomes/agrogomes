export type UsoProdutoTalhao = {
  id: string;
  farmId: string;
  talhaoId: string;
  ordemProgramadaId: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  areaHa?: number;
  lote?: string;
  data: string;
};

export function calcularDosePorHa(quantidade: number, areaHa?: number) {
  if (!areaHa) return 0;

  return quantidade / areaHa;
}