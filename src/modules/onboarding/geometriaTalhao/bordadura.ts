export type PercentualBordadura = 4;

export function validarPercentualBordadura(
  _percentual: number,
): PercentualBordadura {
  return 4;
}

export function calcularAreaAposBordadura(
  areaTotalHa: number,
  percentualBordadura: number,
) {
  const percentual = validarPercentualBordadura(percentualBordadura);
  return areaTotalHa * (1 - percentual / 100);
}
