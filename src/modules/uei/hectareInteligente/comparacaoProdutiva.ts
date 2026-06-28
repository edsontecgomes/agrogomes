export type ComparacaoProdutivaHectare = {
  hectareA: string;
  hectareB: string;
  produtividadeA: number;
  produtividadeB: number;
  diferencaScHa: number;
  diferencaPercentual: number;
};

export function compararProdutividadeHectares(
  hectareA: string,
  hectareB: string,
  produtividadeA: number,
  produtividadeB: number,
): ComparacaoProdutivaHectare {
  const diferencaScHa = produtividadeA - produtividadeB;
  const diferencaPercentual = produtividadeB
    ? (diferencaScHa / produtividadeB) * 100
    : 0;

  return {
    hectareA,
    hectareB,
    produtividadeA,
    produtividadeB,
    diferencaScHa,
    diferencaPercentual,
  };
}