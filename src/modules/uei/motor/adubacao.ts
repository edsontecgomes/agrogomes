export type FormulacaoAdubo = {
  nome: string;
  nitrogenio: number;
  fosforo: number;
  potassio: number;
};

export type ParcelaAdubacao = {
  data: string;
  doseKgHa: number;
  observacao?: string;
};

export type RegistroAdubacaoUei = {
  ueiId: string;
  safra: string;
  formulacao: FormulacaoAdubo;
  doseTotalKgHa: number;
  parcelas: ParcelaAdubacao[];
};

export function calcularDoseTotalParcelas(parcelas: ParcelaAdubacao[]) {
  return parcelas.reduce((total, parcela) => total + parcela.doseKgHa, 0);
}