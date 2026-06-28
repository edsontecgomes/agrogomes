export type BaseConfiabilidadeHectare = {
  chuva: boolean;
  manejo: boolean;
  genetica: boolean;
  produtividade: boolean;
  solo: boolean;
  telemetria: boolean;
};

export function calcularConfiabilidadeHectare(base: BaseConfiabilidadeHectare) {
  let score = 0;

  if (base.chuva) score += 20;
  if (base.manejo) score += 20;
  if (base.genetica) score += 15;
  if (base.produtividade) score += 25;
  if (base.solo) score += 10;
  if (base.telemetria) score += 10;

  return Math.min(score, 100);
}