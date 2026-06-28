export type Influencia = {
  fator: string;
  percentual: number;
};

export function normalizarInfluencias(
  influencias: Influencia[],
) {
  const total = influencias.reduce(
    (soma, item) => soma + item.percentual,
    0,
  );

  if (!total) return influencias;

  return influencias.map((item) => ({
    ...item,
    percentual: (item.percentual / total) * 100,
  }));
}