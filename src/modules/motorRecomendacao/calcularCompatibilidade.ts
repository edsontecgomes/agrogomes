import type {
  CriterioRecomendacao,
} from "./types";

export function calcularCompatibilidade(
  criterios: CriterioRecomendacao[],
): number {
  if (criterios.length === 0) {
    return 0;
  }

  const pesoTotal =
    criterios.reduce(
      (total, criterio) =>
        total +
        Math.max(
          0,
          criterio.peso,
        ),
      0,
    );

  if (pesoTotal === 0) {
    return 0;
  }

  const pontos =
    criterios.reduce(
      (total, criterio) =>
        total +
        Math.max(
          0,
          criterio.pontuacao,
        ),
      0,
    );

  return Number(
    Math.min(
      100,
      (pontos / pesoTotal) * 100,
    ).toFixed(2),
  );
}