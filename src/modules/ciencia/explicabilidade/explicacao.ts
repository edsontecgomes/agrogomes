import { FatorImpacto } from "./fatorImpacto";

export type ExplicacaoCientifica = {
  hectareId: string;
  fatores: FatorImpacto[];
  ganhoTotalEstimado: number;
};

export function calcularGanhoEstimado(
  fatores: FatorImpacto[],
) {
  return fatores.reduce(
    (total, fator) => total + fator.impactoScHa,
    0,
  );
}