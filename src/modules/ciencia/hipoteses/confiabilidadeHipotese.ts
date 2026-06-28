import { NivelConfiabilidade } from "../tipos";
import { EvidenciaHipotese } from "./evidencia";

export function calcularScoreConfiabilidadeHipotese(
  evidencias: EvidenciaHipotese[],
) {
  return evidencias.reduce((total, evidencia) => total + evidencia.peso, 0);
}

export function classificarConfiabilidadeHipotese(
  score: number,
): NivelConfiabilidade {
  if (score >= 20) return "muito_alto";
  if (score >= 12) return "alto";
  if (score >= 6) return "medio";
  if (score >= 2) return "baixo";

  return "muito_baixo";
}