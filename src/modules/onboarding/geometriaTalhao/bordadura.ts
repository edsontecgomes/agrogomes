export type PercentualBordadura = 10 | 15 | 20;

export function validarPercentualBordadura(percentual: number): PercentualBordadura {
  if (percentual <= 10) return 10;
  if (percentual <= 15) return 15;
  return 20;
}

export function calcularAreaAposBordadura(
  areaTotalHa: number,
  percentualBordadura: number,
) {
  const percentual = validarPercentualBordadura(percentualBordadura);
  return areaTotalHa * (1 - percentual / 100);
}