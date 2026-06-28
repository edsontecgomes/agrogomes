export type PercentualBordaduraTalhao = 10 | 15 | 20;

export function normalizarBordaduraTalhao(
  percentual?: number,
): PercentualBordaduraTalhao {
  if (!percentual || percentual <= 10) return 10;
  if (percentual <= 15) return 15;
  return 20;
}

export function calcularAreaOperacionalTalhao(
  areaHa: number,
  bordaduraPercentual: number,
) {
  const bordadura = normalizarBordaduraTalhao(bordaduraPercentual);
  return areaHa * (1 - bordadura / 100);
}