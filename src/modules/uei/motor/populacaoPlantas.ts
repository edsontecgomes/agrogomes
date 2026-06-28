export type RegistroPopulacaoPlantas = {
  ueiId: string;
  data: string;
  plantasPorHectare: number;
  origem: "drone" | "manual" | "estimado";
};

export function calcularDiferencaPopulacao(
  populacaoReal: number,
  populacaoAlvo: number,
) {
  if (!populacaoAlvo) return 0;

  return ((populacaoReal - populacaoAlvo) / populacaoAlvo) * 100;
}