export function media(valores: number[]) {
  if (!valores.length) return 0;

  return (
    valores.reduce((a, b) => a + b, 0) /
    valores.length
  );
}

export function soma(valores: number[]) {
  return valores.reduce((a, b) => a + b, 0);
}

export function percentual(
  valor: number,
  total: number
) {
  if (!total) return 0;

  return (valor / total) * 100;
}