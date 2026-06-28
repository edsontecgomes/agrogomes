import { RegistroAdubacaoUei } from "./adubacao";

export function calcularNutrientesAplicados(registro: RegistroAdubacaoUei) {
  const dose = registro.doseTotalKgHa;

  return {
    nitrogenioKgHa: (dose * registro.formulacao.nitrogenio) / 100,
    fosforoKgHa: (dose * registro.formulacao.fosforo) / 100,
    potassioKgHa: (dose * registro.formulacao.potassio) / 100,
  };
}

export function calcularScPorKgAdubo(
  produtividadeScHa: number,
  doseTotalKgHa: number,
) {
  if (!doseTotalKgHa) return 0;

  return produtividadeScHa / doseTotalKgHa;
}