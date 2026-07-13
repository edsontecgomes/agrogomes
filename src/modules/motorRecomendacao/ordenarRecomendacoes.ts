import type {
  RecomendacaoAgronomica,
} from "./types";

export function ordenarRecomendacoes(
  recomendacoes:
    RecomendacaoAgronomica[],
): RecomendacaoAgronomica[] {
  return [
    ...recomendacoes,
  ].sort(
    (primeira, segunda) => {
      if (
        segunda.pontuacaoFinal !==
        primeira.pontuacaoFinal
      ) {
        return (
          segunda.pontuacaoFinal -
          primeira.pontuacaoFinal
        );
      }

      if (
        segunda.confiabilidade !==
        primeira.confiabilidade
      ) {
        return (
          segunda.confiabilidade -
          primeira.confiabilidade
        );
      }

      return (
        primeira.pontuacaoRisco -
        segunda.pontuacaoRisco
      );
    },
  );
}