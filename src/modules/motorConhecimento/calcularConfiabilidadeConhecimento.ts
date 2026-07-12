import type {
  EvidenciaAprendizado,
} from "../motorAprendizagem/types";

export function calcularConfiabilidadeConhecimento(
  evidencias: EvidenciaAprendizado[],
): number {
  if (evidencias.length === 0) {
    return 0;
  }

  const pesoTotal =
    evidencias.reduce(
      (total, evidencia) =>
        total +
        Math.max(
          0,
          evidencia.peso,
        ),
      0,
    );

  if (pesoTotal === 0) {
    return 0;
  }

  const valorPonderado =
    evidencias.reduce(
      (total, evidencia) =>
        total +
        Math.max(
          0,
          Math.min(
            1,
            evidencia.confiabilidade,
          ),
        ) *
          Math.max(
            0,
            evidencia.peso,
          ),
      0,
    );

  const percentualFavoravel =
    evidencias.filter(
      (evidencia) =>
        evidencia.favoravel,
    ).length / evidencias.length;

  const confiabilidadeBase =
    valorPonderado / pesoTotal;

  const resultado =
    confiabilidadeBase * 0.75 +
    percentualFavoravel * 0.25;

  return Number(
    Math.min(
      1,
      resultado,
    ).toFixed(2),
  );
}