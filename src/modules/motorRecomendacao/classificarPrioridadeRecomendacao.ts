import type {
  PrioridadeRecomendacao,
} from "./types";

export function classificarPrioridadeRecomendacao(
  pontuacaoFinal: number,
  risco: number,
): PrioridadeRecomendacao {
  if (
    pontuacaoFinal >= 80 &&
    risco <= 35
  ) {
    return "critica";
  }

  if (pontuacaoFinal >= 65) {
    return "alta";
  }

  if (pontuacaoFinal >= 40) {
    return "media";
  }

  return "baixa";
}