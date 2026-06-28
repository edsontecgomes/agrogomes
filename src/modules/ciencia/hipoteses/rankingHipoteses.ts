export type ItemRankingHipotese = {
  hipoteseId: string;
  score: number;
};

export function ordenarHipotesesPorScore(itens: ItemRankingHipotese[]) {
  return [...itens].sort((a, b) => b.score - a.score);
}

export function obterTopHipoteses(itens: ItemRankingHipotese[], limite = 10) {
  return ordenarHipotesesPorScore(itens).slice(0, limite);
}