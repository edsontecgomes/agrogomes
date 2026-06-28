import { calcularGanhoEstimado, ExplicacaoCientifica } from "./explicacao";
import { FatorImpacto } from "./fatorImpacto";

export function gerarExplicacao(
  hectareId: string,
  fatores: FatorImpacto[],
): ExplicacaoCientifica {
  return {
    hectareId,
    fatores,
    ganhoTotalEstimado: calcularGanhoEstimado(fatores),
  };
}