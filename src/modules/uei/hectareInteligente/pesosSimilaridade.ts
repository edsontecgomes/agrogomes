export type PesosSimilaridadeHectare = {
  ambiente: number;
  genetica: number;
  manejo: number;
  operacao: number;
  respostaPlanta: number;
};

export const PESOS_PADRAO_SIMILARIDADE: PesosSimilaridadeHectare = {
  ambiente: 35,
  genetica: 20,
  manejo: 20,
  operacao: 10,
  respostaPlanta: 15,
};

export function normalizarPesosSimilaridade(pesos: PesosSimilaridadeHectare) {
  const total =
    pesos.ambiente +
    pesos.genetica +
    pesos.manejo +
    pesos.operacao +
    pesos.respostaPlanta;

  if (!total) return PESOS_PADRAO_SIMILARIDADE;

  return {
    ambiente: (pesos.ambiente / total) * 100,
    genetica: (pesos.genetica / total) * 100,
    manejo: (pesos.manejo / total) * 100,
    operacao: (pesos.operacao / total) * 100,
    respostaPlanta: (pesos.respostaPlanta / total) * 100,
  };
}