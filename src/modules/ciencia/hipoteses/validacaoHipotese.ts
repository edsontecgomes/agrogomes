import { StatusHipotese } from "./hipotese";

export function definirStatusHipotese(
  scoreConfiabilidade: number,
  impactoEstimadoScHa?: number,
): StatusHipotese {
  if (scoreConfiabilidade >= 12 && Math.abs(impactoEstimadoScHa || 0) >= 3) {
    return "validada";
  }

  if (scoreConfiabilidade >= 6) {
    return "em_observacao";
  }

  return "rascunho";
}