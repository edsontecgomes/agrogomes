export type FatorImpacto = {
  fator: string;
  impactoScHa: number;
  confiabilidade: number;
};

export function ordenarImpactos(
  fatores: FatorImpacto[],
) {
  return [...fatores].sort(
    (a, b) => b.impactoScHa - a.impactoScHa,
  );
}