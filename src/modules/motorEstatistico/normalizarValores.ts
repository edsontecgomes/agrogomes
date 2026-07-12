export function valorNumericoValido(
  valor: unknown,
): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor)
  );
}

export function normalizarValores(
  valores: unknown[],
): number[] {
  if (!Array.isArray(valores)) {
    return [];
  }

  return valores.filter(valorNumericoValido);
}