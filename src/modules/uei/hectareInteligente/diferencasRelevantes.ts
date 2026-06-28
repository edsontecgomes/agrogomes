export type DiferencaRelevante = {
  fator: string;
  valorA: unknown;
  valorB: unknown;
  impactoEstimadoScHa?: number;
};

export function filtrarDiferencasComImpacto(
  diferencas: DiferencaRelevante[],
) {
  return diferencas.filter(
    (diferenca) =>
      diferenca.impactoEstimadoScHa !== undefined &&
      Math.abs(diferenca.impactoEstimadoScHa) > 0,
  );
}