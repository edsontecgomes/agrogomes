export type EntradaMaturidadeGDA = {
  totalSafras: number;
  totalEventos: number;
  temSolo?: boolean;
  temProdutividade?: boolean;
  temChuva?: boolean;
  temOperacoes?: boolean;
};

export function calcularIndiceMaturidadeGDA(entrada: EntradaMaturidadeGDA) {
  let score = 0;

  score += Math.min(entrada.totalSafras * 15, 45);
  score += Math.min(entrada.totalEventos * 2, 25);

  if (entrada.temSolo) score += 10;
  if (entrada.temProdutividade) score += 10;
  if (entrada.temChuva) score += 5;
  if (entrada.temOperacoes) score += 5;

  return Math.min(score, 100);
}