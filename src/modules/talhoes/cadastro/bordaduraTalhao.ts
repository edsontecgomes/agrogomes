export const DISTANCIA_SEGURANCA_OPERACIONAL_METROS =
  20 as const;

export const BORDADURA_AGRONOMICA_PERCENTUAL =
  4 as const;

export type PercentualBordaduraTalhao =
  typeof BORDADURA_AGRONOMICA_PERCENTUAL;

export function normalizarBordaduraTalhao(
  _percentual?: number,
): PercentualBordaduraTalhao {
  return BORDADURA_AGRONOMICA_PERCENTUAL;
}

export function calcularAreaOperacionalTalhao(
  areaHa: number,
  bordaduraPercentual: number,
) {
  const bordadura = normalizarBordaduraTalhao(bordaduraPercentual);
  return areaHa * (1 - bordadura / 100);
}
