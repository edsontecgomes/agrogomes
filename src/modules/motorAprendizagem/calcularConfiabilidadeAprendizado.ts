import { EvidenciaAprendizado } from "./types";

export function calcularConfiabilidadeAprendizado(
  evidencias: EvidenciaAprendizado[],
): number {
  if (evidencias.length === 0) {
    return 0;
  }

  const pesoTotal = evidencias.reduce(
    (total, evidencia) =>
      total + Math.max(0, evidencia.peso),
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
          Math.max(0, evidencia.peso),
      0,
    );

  const confiabilidade =
    valorPonderado / pesoTotal;

  return Number(
    Math.min(
      1,
      confiabilidade,
    ).toFixed(2),
  );
}