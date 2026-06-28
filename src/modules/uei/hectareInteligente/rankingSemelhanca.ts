export type ItemRankingSemelhanca = {
  hectareId: string;
  scoreSimilaridade: number;
};

export function ordenarRankingSemelhanca(itens: ItemRankingSemelhanca[]) {
  return [...itens].sort((a, b) => b.scoreSimilaridade - a.scoreSimilaridade);
}

export function obterTopHectaresSemelhantes(
  itens: ItemRankingSemelhanca[],
  limite = 10,
) {
  return ordenarRankingSemelhanca(itens).slice(0, limite);
}