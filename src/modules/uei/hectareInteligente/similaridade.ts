export type FatorSimilaridadeHectare = {
  fator: string;
  peso: number;
  diferencaPercentual: number;
};

export function calcularSimilaridadeHectares(fatores: FatorSimilaridadeHectare[]) {
  if (!fatores.length) return 0;

  const pesoTotal = fatores.reduce((total, fator) => total + fator.peso, 0);
  if (!pesoTotal) return 0;

  const score = fatores.reduce((total, fator) => {
    const similaridade = Math.max(0, 100 - fator.diferencaPercentual);
    return total + similaridade * fator.peso;
  }, 0);

  return score / pesoTotal;
}